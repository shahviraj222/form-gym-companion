(function (root) {
  'use strict';
  // Original, brief movement cues checked against the linked reference instructions.
  // Sets, repetitions and timers remain defined by the user's plan in core.js.
  const nasm = (title, slug) => ({title:'NASM · '+title,url:'https://www.nasm.org/resource-center/exercise-library/'+slug});
  const ace = (title, path) => ({title:'ACE · '+title,url:'https://www.acefitness.org/'+path});
  const guides = {
    'Push-ups': {
      equipment:'Clear floor · mat optional',
      cue:'Lower and lift your whole body together, keeping a straight line from head to heels.',
      steps:['Start on hands and toes; hands just wider than shoulders.','Bend your elbows back at about 45° and lower your chest.','Press the floor away to return to straight arms.'],
      avoid:'Keep your hips from sagging and your elbows from spreading straight out.',
      source:nasm('Push-up','push-up')
    },
    'Pike push-ups': {
      equipment:'Clear floor · mat optional',
      cue:'Make an upside-down V, then bend your elbows to lower your head toward the floor.',
      steps:['Plant hands and feet; lift your hips high into an upside-down V.','Bend your elbows and lower your head between your hands.','Push through your palms to lift back up; keep your hips high.'],
      avoid:'Do not rest your head on the floor or let your hips drop into a regular push-up.',
      source:nasm('Pike push-up','pike-push-up')
    },
    'Chair dips': {
      equipment:'Stable, secured chair without wheels',
      cue:'Keep your hips close to the chair as your elbows bend backward, then press up.',
      steps:['Secure a sturdy chair against a wall. Grip the seat beside your hips.','Slide your hips off; knees bent and feet flat. Bend elbows backward.','Lower only as far as comfortable, no deeper than 90°, then press up.'],
      avoid:'Do not use a sliding chair, sink too low, or let your shoulders rise toward your ears.',
      source:nasm('Bench dips','bench-dips'),
      note:'Shown with bent knees and feet near the chair.'
    },
    'Crunches': {
      equipment:'Mat or comfortable floor',
      cue:'Curl your shoulders a little off the floor while your lower back stays down.',
      steps:['Lie on your back, knees bent and feet flat. Lightly support your head.','Breathe out and curl your ribs toward your hips; lift your shoulder blades.','Lower your shoulders slowly to the mat.'],
      avoid:'Do not pull on your neck or turn the small curl into a full sit-up.',
      source:ace('Crunch','resources/everyone/exercise-library/52/crunch/')
    },
    'Leg raises': {
      equipment:'Mat or comfortable floor',
      cue:'Lift both legs together, then lower slowly without arching your lower back.',
      steps:['Lie on your back with legs together and hands beside or under your hips.','Tighten your abs and raise your legs toward vertical.','Lower slowly; stop before your lower back starts lifting from the mat.'],
      avoid:'Do not swing your legs or lower so far that your back arches.',
      source:ace('Leg raises','resources/pros/expert-articles/4957/6-moves-for-a-stronger-core/'),
      note:'Shown as lying leg raises, with your head resting on the mat.'
    },
    'Plank': {
      equipment:'Mat or comfortable floor',
      cue:'Rest on your forearms and toes; hold your body long and level while breathing.',
      steps:['Place your elbows below your shoulders and forearms on the floor.','Step your feet back and lift your knees; tighten abs and glutes.','Hold a line from head to heels and breathe steadily.'],
      avoid:'Do not drop your hips, lift your bottom high, or hold your breath.',
      source:nasm('Plank','plank')
    },
    'Squats': {
      equipment:'Clear floor',
      cue:'Sit your hips back and down, keeping your heels grounded, then stand tall.',
      steps:['Stand with feet about shoulder-width apart and toes slightly outward.','Bend hips and knees; lower as if sitting, with knees following your toes.','Push through your feet to stand back up.'],
      avoid:'Do not let your knees collapse inward or your heels lift.',
      source:ace('Bodyweight squat','resources/everyone/exercise-library/135/bodyweight-squat/')
    },
    'Reverse lunges': {
      equipment:'Clear floor',
      cue:'Step one foot backward, lower both knees, then bring that foot forward to stand.',
      steps:['Stand tall, feet hip-width apart. Step your right foot backward.','Bend both knees; keep the left foot flat and your front knee in line.','Push through the left foot and bring the right foot back. Repeat other side.'],
      avoid:'Do not cross the back foot behind the front foot or drop the knee hard onto the floor.',
      source:ace('Reverse lunge','resources/pros/expert-articles/7952/4-causes-of-knee-pain-and-6-exercises-to-help-reduce-that-pain/'),
      note:'The stepping foot moves backward. Complete the plan’s reps for each leg.'
    },
    'Glute bridges': {
      equipment:'Mat or comfortable floor',
      cue:'Press through your heels to lift your hips, squeezing your glutes at the top.',
      steps:['Lie on your back, knees bent and feet flat at hip width.','Tighten your abs and squeeze your glutes to raise your hips.','Stop with shoulders, hips and knees aligned, then lower slowly.'],
      avoid:'Do not push your hips so high that you arch your lower back.',
      source:ace('Glute bridge','resources/everyone/exercise-library/49/glute-bridge/')
    },
    'Wall sit': {
      equipment:'Solid wall · clear, nonslip floor',
      cue:'Slide down the wall into a seated position and hold with your feet flat.',
      steps:['Place your back against a wall and walk your feet forward.','Slide down to a comfortable squat; knees stay above your ankles.','Keep your back against the wall and breathe, then slide up to finish.'],
      avoid:'Do not push on your thighs, let your knees fall inward, or hold your breath.',
      source:{title:'NASM · Wall sits',url:'https://www.nasm.org/resource-center/blog/training/wall-sits'}
    },
    'Mountain climbers': {
      equipment:'Clear floor · mat optional',
      cue:'From a high plank, bring alternate knees toward your chest while your hips stay steady.',
      steps:['Start on hands and toes with your hands below your shoulders.','Bring one knee toward your chest while keeping the other leg extended.','Return that leg and switch knees, keeping your abs tight.'],
      avoid:'Do not bounce your hips high or let your lower back sag.',
      source:ace('Mountain climbers','resources/pros/expert-articles/4919/summer-boot-camp-core-workout/')
    },
    'Side plank': {
      equipment:'Mat or comfortable floor',
      cue:'Support yourself on one forearm and the side of your foot, then lift your hips.',
      steps:['Lie on the side shown by the timer; place that elbow below your shoulder.','Extend and stack your legs. Lift your hips so your body makes one line.','Hold and breathe; lower gently. The app guides you through both sides.'],
      avoid:'Do not let your hips sink or your chest rotate toward the floor.',
      source:nasm('Side plank','side-plank'),
      note:'Left means your left forearm is on the floor; right means your right forearm is down.'
    },
    'Backpack rows': {
      equipment:'Zipped backpack with balanced, secured contents',
      cue:'Hinge forward, then pull the backpack toward your waist without moving your torso.',
      steps:['Zip a balanced load into the bag; grip secure straps with both hands.','Soften your knees and hinge at your hips, keeping your back straight.','Pull the bag toward your waist with elbows back, then lower slowly.'],
      avoid:'Do not round your back, jerk the bag, or use damaged straps.',
      source:ace('Bent-over row technique','resources/everyone/exercise-library/12/bent-over-row/'),
      note:'The illustration adapts a two-arm bent-over row to the backpack in your plan.'
    },
    'Superman': {
      equipment:'Mat or comfortable floor',
      cue:'Lie face down and gently lift your arms and legs a few inches, then lower.',
      steps:['Lie on your stomach with legs straight and arms reaching overhead.','Tighten your middle and lift both arms and legs a small distance.','Keep looking down; pause briefly and lower under control.'],
      avoid:'Do not throw your head upward or force a large arch in your lower back.',
      source:ace('Superman','resources/everyone/exercise-library/9/supermans/')
    },
    'Reverse snow angels': {
      equipment:'Mat or comfortable floor',
      cue:'Lie face down and sweep your lifted arms from your sides to overhead and back.',
      steps:['Lie on your stomach, arms by your hips and palms facing down.','Lift your arms slightly and sweep them wide toward your ears.','Keep the arms long and reverse the sweep to your hips.'],
      avoid:'Do not shrug your shoulders, lift your head, or force your arms beyond a comfortable range.',
      source:ace('Reverse snow angels','resources/pros/expert-articles/5717/15-minute-upper-body-workout-using-nontraditional-equipment/'),
      note:'Shown without the water bottles used in the reference variation.'
    },
    'Bicycle crunches': {
      equipment:'Mat or comfortable floor',
      cue:'Turn your shoulder toward the opposite knee as the other leg extends, then switch.',
      steps:['Lie on your back, support your head lightly and lift your bent knees.','Curl your left shoulder toward your right knee; extend your left leg.','Switch sides slowly, keeping your lower back against the mat.'],
      avoid:'Do not tug your neck or rush; rotate your chest rather than just waving your elbows.',
      source:ace('Bicycle crunches','resources/everyone/exercise-library/241/supine-bicycle-crunches/')
    },
    'Walking': {
      equipment:'Comfortable shoes · clear walking route',
      cue:'Walk smoothly with relaxed shoulders and a natural arm swing.',
      steps:['Stand tall, look ahead and relax your neck and shoulders.','Take comfortable steps, rolling your feet from heel to toe.','Let your arms swing naturally and keep an easy, steady pace.'],
      avoid:'Do not hunch over your phone or force unusually long steps.',
      source:{title:'Mayo Clinic · Walking technique',url:'https://sportsmedicine.mayoclinic.org/news/walking-trim-your-waistline-improve-your-health/'}
    },
    'Stretching': {
      equipment:'Solid wall for this example',
      cue:'Example: standing calf stretch; your PDF does not specify stretches.',
      steps:['For this example, face a wall and place both palms against it.','Step one leg back, keeping that knee straight and its heel grounded.','Gently bend the front knee to feel the back calf stretch; change sides.'],
      avoid:'Do not bounce, stretch into pain, or hold this one position for the full 10 minutes.',
      source:{title:'NHS · Standing calf stretch',url:'https://www.cpft.nhs.uk/download/docm93jijm4n7823.pdf?ver=11354'},
      note:'This shows one example only. Your PDF’s 10 minutes is total stretching time, not a calf-hold target.'
    },
    'Lunges': {
      equipment:'Clear floor',
      cue:'Step one foot forward, lower both knees, then push back to your starting position.',
      steps:['Stand tall and step your right foot forward, keeping feet hip-width apart.','Bend both knees and lower your hips; keep the front foot flat.','Push off the right foot to return to standing, then repeat on the other leg.'],
      avoid:'Do not cross your feet or let the front knee collapse inward.',
      source:ace('Forward lunge','resources/everyone/exercise-library/94/forward-lunge/'),
      note:'Shown as forward lunges. The stepping foot moves forward; complete the reps for each leg.'
    },
    'Jumping jacks': {
      equipment:'Clear floor and overhead space',
      cue:'Jump your feet apart as your arms rise overhead, then jump back together.',
      steps:['Start upright with feet together and arms by your sides.','Jump your feet apart while sweeping your arms overhead.','Jump feet together and lower your arms; land softly each time.'],
      avoid:'Do not land with stiff knees or slam your feet into the floor.',
      source:nasm('Jumping jacks','jumping-jacks')
    },
    'High knees': {
      equipment:'Clear floor',
      cue:'Run in place, bringing one knee up at a time and pumping the opposite arm.',
      steps:['Stand tall with relaxed shoulders and elbows bent.','Lift your right knee toward hip height as the left arm moves forward.','Switch legs in a running rhythm and land lightly beneath your body.'],
      avoid:'Do not lean backward or sacrifice balance to lift your knees higher.',
      source:ace('High knees','resources/everyone/blog/5430/rev-up-your-cardio-with-this-15-minute-drill/')
    },
    'Burpees': {
      equipment:'Clear floor and overhead space',
      cue:'Squat, move your feet back to a plank, bring them forward and jump up.',
      steps:['Squat down and place your palms on the floor beside your feet.','Step or jump your feet back to a strong high plank, then bring them forward.','Stand and jump with arms overhead; land softly and repeat.'],
      avoid:'Do not let your hips drop in the plank or land with locked knees.',
      source:nasm('Burpee variations','squat-thrust-burpees'),
      note:'Shown without a push-up. Your PDF names burpees without specifying a variation.'
    },
    'Hollow-body hold': {
      equipment:'Mat or comfortable floor',
      cue:'Keep your lower back pressed down while your shoulders, arms and legs hover.',
      steps:['Lie on your back, tighten your abs and lift your shoulder blades.','Extend your legs forward and reach your arms overhead beside your ears.','Keep your lower back touching the mat and hold while breathing.'],
      avoid:'Do not let your lower back lift; raise or bend your legs if needed to keep contact.',
      source:{title:'CrossFit · Hollow body position',url:'https://assets.crossfit.com/pdfs/seminars/SMERefs/Gymnastics/GymnasticsCourse_SeminarGuide.pdf'}
    }
  };
  if(typeof module!=='undefined') module.exports=guides;
  root.ExerciseGuides=guides;
})(typeof window!=='undefined'?window:globalThis);
