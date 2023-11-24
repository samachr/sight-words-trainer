import { SightWordsTrainer } from "./sightWordsTrainer.mjs";

export default class SpeakSightWordsTrainer extends SightWordsTrainer {
  constructor(wordLists) {
    super(wordLists)
    if(!document.getElementById('listeningIndicator')) {
      const listeningIndicator = document.createElement('div')
      listeningIndicator.id = 'listeningIndicator'
      document.body.append(listeningIndicator)
      this.listeningIndicator = listeningIndicator;
    }
    this.speechRecognition = new webkitSpeechRecognition();
    this.listening = false
  }

  onStart() {
    this.full_transcript = ''
    this.used_transcript = ''
    this.speechRecognition.continuous = true;
    this.speechRecognition.maxAlternatives = 10;
    this.speechRecognition.onerror = this.updateIndicator.bind(this)
    this.speechRecognition.onend =  () => this.listening && this.speechRecognition.start()
    this.speechRecognition.onresult = (event) => {
      const results = []
      for (let resultIndex = 0; resultIndex < event.results[event.resultIndex].length; resultIndex++) {
        results.push(...event.results[event.resultIndex][resultIndex].transcript.trim().toLowerCase().split(' '))
      }

      document.querySelector("#listeningIndicator").innerHTML = results.join(', ');

      const words = results.filter(recognizedWord =>
        this.words.indexOf(recognizedWord) != -1
      )

      const word = words.find((word) => word == this.correctWord())

      if (word) {
        this.checkWord(
          (word).toLowerCase(),
          document.getElementById(`word-${this.correctWord()}`)
        )
        this.used_transcript = this.full_transcript
      }
    };

    this.speechRecognition.start();
    this.listening = true;
  }

  onStop() {
    if(this.speechRecognition) {
      this.speechRecognition.stop();
      this.listening = false;
    }
  }

  updateIndicator(event) {
    console.log(event.type)
    this.listeningIndicator.innerHTML = event.type;
  }

  speak(word) {
    const container = document.getElementById('responseOptions')
    container.innerHTML = ''
    this.listenForWord(word, () => {
      const result = document.createElement('button')
      result.innerHTML = word;
      result.className = 'response-option'
      result.id = `word-${word}`
      result.style.gridColumn = '1 / span 3'
      container.appendChild(result)
    });

    Object.keys(this.timings).forEach(key => this.timings[key] += 500)
  }

  listenForWord(word, onReady) {

    onReady()
  }
}
