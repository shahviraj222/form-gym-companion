package com.sixpack.trainer;

import android.app.Activity;
import android.content.*;
import android.database.Cursor;
import android.graphics.Color;
import android.media.*;
import android.net.Uri;
import android.os.*;
import android.provider.OpenableColumns;
import android.view.*;
import android.webkit.*;
import android.widget.Toast;
import android.widget.FrameLayout;
import org.json.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

/** Offline bundled UI with narrowly scoped storage and media bridges. */
public class MainActivity extends Activity {
    private static final String ORIGIN = "https://app.form.local/";
    private static final int PICK_SONGS = 41, EXPORT = 42;
    private WebView web;
    private SharedPreferences prefs;
    private AudioManager audioManager;
    private AudioFocusRequest focusRequest;
    private MediaPlayer player;
    private JSONArray songs = new JSONArray();
    private int currentSong = -1;
    private boolean prepared, wantsMusic, foreground, hasFocus;
    private final Random random = new Random();
    private final BroadcastReceiver noisyReceiver = new BroadcastReceiver() {
        @Override public void onReceive(Context context, Intent intent) { pauseForInterruption(); }
    };

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        prefs = getSharedPreferences("form", MODE_PRIVATE);
        try { songs = new JSONArray(prefs.getString("songs", "[]")); } catch (JSONException ignored) {}
        audioManager = (AudioManager)getSystemService(AUDIO_SERVICE);
        focusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
            .setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA)
            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build())
            .setOnAudioFocusChangeListener(change -> { if (change < 0) pauseForInterruption(); })
            .build();
        IntentFilter filter = new IntentFilter(AudioManager.ACTION_AUDIO_BECOMING_NOISY);
        if (Build.VERSION.SDK_INT >= 33) registerReceiver(noisyReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        else registerReceiver(noisyReceiver, filter);
        createWebView();
    }

    private void createWebView() {
        web = new WebView(this);
        web.setBackgroundColor(Color.rgb(17,20,17));
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setSupportMultipleWindows(false);
        web.addJavascriptInterface(new Bridge(), "Android");
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                // No external pages may access the native JavaScript bridge.
                return true;
            }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.startsWith(ORIGIN)) {
                    String path = url.substring(ORIGIN.length());
                    if (path.isEmpty()) path = "index.html";
                    if (Arrays.asList("index.html", "styles.css", "core.js", "app.js", "exercise-visuals.js", "exercise-guides.js", "nutrition.js").contains(path)) {
                        try {
                            String mime = path.endsWith(".css") ? "text/css" : path.endsWith(".js") ? "application/javascript" : "text/html";
                            return new WebResourceResponse(mime, "UTF-8", getAssets().open(path));
                        } catch(IOException ignored) {}
                    }
                }
                return new WebResourceResponse("text/plain", "UTF-8", 403, "Blocked", Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
            }
            @Override public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                setMusicActive(false);
                view.destroy();
                createWebView();
                return true;
            }
        });
        // Insets protect content on Android 15+ edge-to-edge devices, including S23+.
        FrameLayout container = new FrameLayout(this);
        container.addView(web, new FrameLayout.LayoutParams(-1,-1));
        container.setOnApplyWindowInsetsListener((v, insets) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets b = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout() | WindowInsets.Type.ime());
                v.setPadding(b.left,b.top,b.right,b.bottom);
            } else {
                v.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());
            }
            return Build.VERSION.SDK_INT >= 30 ? WindowInsets.CONSUMED : insets.consumeSystemWindowInsets();
        });
        if (Build.VERSION.SDK_INT >= 30) getWindow().setDecorFitsSystemWindows(false);
        setContentView(container);
        web.loadUrl(ORIGIN + "index.html");
    }

    final class Bridge {
        @JavascriptInterface public String loadState() { return prefs.getString("state", "null"); }
        @JavascriptInterface public void saveState(String json) {
            try { new JSONObject(json); if (!prefs.edit().putString("state", json).commit()) runOnUiThread(() -> message("Unable to save data. Check your device storage.")); }
            catch (JSONException ignored) { runOnUiThread(() -> message("Could not save invalid workout data.")); }
        }
        @JavascriptInterface public void importSongs() { runOnUiThread(() -> {
            Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
            intent.setType("audio/*");
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
            try { startActivityForResult(intent, PICK_SONGS); }
            catch (ActivityNotFoundException e) { message("No file picker found on this device."); }
        }); }
        @JavascriptInterface public void getSongs() { runOnUiThread(() -> sendLibrary()); }
        @JavascriptInterface public void setWorkoutActive(boolean active) { runOnUiThread(() -> setMusicActive(active)); }
        @JavascriptInterface public void setSessionVisible(boolean visible) { runOnUiThread(() -> {
            if (visible && foreground) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        }); }
        @JavascriptInterface public void skipSong() { runOnUiThread(() -> chooseSong()); }
        @JavascriptInterface public void removeSong(int index) { runOnUiThread(() -> {
            if (index < 0 || index >= songs.length()) return;
            String uri = songs.optJSONObject(index).optString("uri");
            if (index == currentSong) { releasePlayer(); currentSong = -1; }
            else if (index < currentSong) currentSong--;
            songs.remove(index);
            try { getContentResolver().releasePersistableUriPermission(Uri.parse(uri),Intent.FLAG_GRANT_READ_URI_PERMISSION); } catch (SecurityException ignored) {}
            saveSongs(); sendLibrary();
            if (wantsMusic && player == null) chooseSong();
        }); }
        @JavascriptInterface public void exportData() { runOnUiThread(() -> {
            Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
            intent.setType("application/json");
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.putExtra(Intent.EXTRA_TITLE, "form-backup.json");
            try { startActivityForResult(intent, EXPORT); }
            catch (ActivityNotFoundException e) { message("No file picker found on this device."); }
        }); }
        @JavascriptInterface public void minimize() { runOnUiThread(() -> moveTaskToBack(true)); }
    }

    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request,result,data);
        if (result != RESULT_OK || data == null) return;
        if (request == PICK_SONGS) {
            List<Uri> selected = new ArrayList<>();
            if (data.getClipData() != null) {
                for (int i=0;i<data.getClipData().getItemCount();i++) selected.add(data.getClipData().getItemAt(i).getUri());
            } else if(data.getData()!=null) selected.add(data.getData());
            int added = 0;
            for (Uri uri:selected) {
                boolean duplicate=false;
                for(int i=0;i<songs.length();i++) if(songs.optJSONObject(i).optString("uri").equals(uri.toString())) duplicate=true;
                if(duplicate) continue;
                try {
                    getContentResolver().takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    String name="Audio track";
                    try(Cursor cursor=getContentResolver().query(uri,new String[]{OpenableColumns.DISPLAY_NAME},null,null,null)) {
                        if(cursor!=null && cursor.moveToFirst()) name=cursor.getString(0);
                    }
                    JSONObject song=new JSONObject();song.put("uri",uri.toString());song.put("name",name);
                    songs.put(song);added++;
                } catch(Exception e) { message("Could not retain access to a song. Select an MP3 stored on this phone."); }
            }
            saveSongs();sendLibrary();message(added+" song"+(added==1?"":"s")+" added");
        } else if(request==EXPORT && data.getData()!=null) {
            try(OutputStream out=getContentResolver().openOutputStream(data.getData())) {
                if(out==null)throw new IOException("No output");
                out.write(prefs.getString("state","{}").getBytes(StandardCharsets.UTF_8));
                message("Workout data exported");
            } catch(IOException e) { message("Export failed. Please choose another location."); }
        }
    }

    private void saveSongs() { prefs.edit().putString("songs",songs.toString()).apply(); }
    private void sendLibrary() { js("window.onMusicLibrary("+JSONObject.quote(songs.toString())+")"); }
    private void status(String text) { js("window.onMusicStatus("+JSONObject.quote(text)+")"); }
    private void message(String text) { Toast.makeText(this,text,Toast.LENGTH_SHORT).show(); }
    private void js(String code) { if(web!=null)web.evaluateJavascript(code,null); }

    private void setMusicActive(boolean active) {
        wantsMusic=active && foreground;
        if(!wantsMusic) {
            if(player!=null && prepared && player.isPlaying())player.pause();
            abandonFocus();
            return;
        }
        if(songs.length()==0) { status("Add songs from Today → Add music"); return; }
        if(!requestFocus()) { status("Audio is busy · Pause and resume to retry"); return; }
        if(player==null)chooseSong();
        else if(prepared){player.start();status(songs.optJSONObject(currentSong).optString("name"));}
    }
    private boolean requestFocus() {
        if(hasFocus)return true;
        hasFocus=audioManager.requestAudioFocus(focusRequest)==AudioManager.AUDIOFOCUS_REQUEST_GRANTED;
        return hasFocus;
    }
    private void abandonFocus() { if(hasFocus){hasFocus=false;audioManager.abandonAudioFocusRequest(focusRequest);} }
    private void chooseSong() {
        if(songs.length()==0){status("No songs added");return;}
        int next;
        if(songs.length()==1)next=0;
        else if(currentSong<0)next=random.nextInt(songs.length());
        else { next=random.nextInt(songs.length()-1);if(next>=currentSong)next++; }
        currentSong=next;
        releasePlayer();
        MediaPlayer candidate=new MediaPlayer();player=candidate;
        candidate.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build());
        candidate.setOnPreparedListener(mp -> {
            if(player!=mp)return;
            prepared=true;
            status(songs.optJSONObject(currentSong).optString("name"));
            if(wantsMusic && foreground && requestFocus())mp.start();
        });
        candidate.setOnCompletionListener(mp -> { if(player==mp && wantsMusic && foreground)chooseSong(); });
        candidate.setOnErrorListener((mp,what,extra) -> {
            if(player==mp){releasePlayer();status("Song unavailable · Skip or re-import this file");}
            return true;
        });
        try {candidate.setDataSource(this,Uri.parse(songs.optJSONObject(currentSong).optString("uri")));candidate.prepareAsync();}
        catch(Exception e){releasePlayer();status("Song unavailable · Skip or re-import this file");}
    }
    private void releasePlayer(){prepared=false;if(player!=null){player.release();player=null;}}
    private void pauseForInterruption(){getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);setMusicActive(false);js("window.onNativePause && window.onNativePause()");}
    @Override protected void onResume(){super.onResume();foreground=true;}
    @Override protected void onPause(){foreground=false;pauseForInterruption();super.onPause();}
    @Override public void onBackPressed(){js("window.onNativeBack && window.onNativeBack()");}
    @Override protected void onDestroy(){unregisterReceiver(noisyReceiver);releasePlayer();abandonFocus();if(web!=null)web.destroy();super.onDestroy();}
}
