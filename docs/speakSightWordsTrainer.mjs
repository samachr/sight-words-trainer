import { SightWordsTrainer } from "./sightWordsTrainer.mjs";

export default class SpeakSightWordsTrainer extends SightWordsTrainer {
  constructor(wordLists) {
    super(wordLists)
  }

  showWords() {}

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

    document.getElementById("progress").value = (this.promptCount) / 10 * 100;
    document.getElementById("progress").innerHTML = (this.promptCount) / 10 * 100;

    Object.keys(this.timings).forEach(key => this.timings[key] += 500)
  }

  listenForWord(word, onReady) {
    const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
    const SpeechGrammarList = window.SpeechGrammarList || webkitSpeechGrammarList;
    const SpeechRecognitionEvent = window.SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

    var speechRecognitionList = new SpeechGrammarList();
    speechRecognitionList.addFromString('#JSGF V1.0; grammar phrases; public <phrase> = ' + this.words.join(' | ') +';', 1);

    var recognition = new SpeechRecognition();
    recognition.grammars = speechRecognitionList;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 10;

    recognition.start();

    let matched = false;
    let ready = false;

    recognition.onresult = (event) => {
      const results = event.results
      let word = results[0][0].transcript;

      let recognizedWords = []
      for (let resultListIndex = 0; resultListIndex < event.results.length; resultListIndex++) {
        for (let resultIndex = 0; resultIndex < event.results[resultListIndex].length; resultIndex++) {
          let result = results[resultListIndex][resultIndex]
          recognizedWords.push(result.transcript)
        }
      }

      console.log(recognizedWords)
      word = recognizedWords.find(recognizedWord =>
        this.words.indexOf(recognizedWord) != -1
      )

      matched = this.checkWord(
        (word || '').toLowerCase(),
        document.getElementById(`word-${this.correctWord()}`)
      )
    }
    recognition.onspeechend = () => {
      console.log('SpeechRecognition.onspeechend')
    }

    recognition.onerror = (event) => {
      console.log('Error occurred in recognition: ' + event.error);
      this.checkWord(
        'This error is not a match!',
        document.getElementById(`word-${this.correctWord()}`),
      )
    }
    recognition.onaudiostart = (event) => {
      console.log('SpeechRecognition.onaudiostart')
      ready = true;
      onReady();
    };
    recognition.onaudioend = (event) => console.log('SpeechRecognition.onaudioend');
    recognition.onend = (event) => {
      console.log('SpeechRecognition.onend')
      if (ready && !matched && this.correctIndex != -1) {
        this.checkWord(
          'This error is not a match!',
          document.getElementById(`word-${this.correctWord()}`),
        )
      }
    };
    recognition.onnomatch = () => console.log('SpeechRecognition.onnomatch');
    recognition.onsoundstart = (event) => console.log('SpeechRecognition.onsoundstart');
    recognition.onsoundend = (event) => console.log('SpeechRecognition.onsoundend');
    recognition.onspeechstart = (event) => console.log('SpeechRecognition.onspeechstart');
    recognition.onstart = (event) => console.log('SpeechRecognition.onstart');
  }
}
