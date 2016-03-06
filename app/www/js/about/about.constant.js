(function()
{
  angular
    .module('about')
    .constant('FAQs', [
      {
        question: 'What is the objective of the game?',
        answer: 'The objective of City Capture is to capture more flags on the map than the other team within the time limit.'
      },
      {
        question: 'How do I capture flags?',
        answer: 'First, locate a flag on the map that you want to capture and start moving towards it. Once you are within 10 meters of the flag, you will automatically begin capturing it as long as you have your mobile device with you and the app running.'
      },
      {
        question: 'What if the other team has already captured a flag?',
        answer: 'You can still capture the flag! You need to undo the other team\'s capture by standing at the flag location for as long as the other team was at the location. So, if the other team stood at the flag for 30 seconds, once you stand at the same flag for 31 seconds, then your team will now own the flag. Your points towards the flag will now start to accumulate.'
      },
      {
        question: 'What are points?',
        answer: 'Points specify how long a team was at a location. Every 1 second, you gain 1 point for every member of your team that is at the location. That is, if you have 3 team members at a flag location, you will gain three points per second.'
      },
      {
        question: 'How long are the games?',
        answer: 'Games can be between 1 and 6 hours. The 1 hour games are meant to be more competitive, with fast-pace action, while the 6 hour games are more leisurely and allow you to explore the places that harbor the flag.'
      }
    ]);

})();
