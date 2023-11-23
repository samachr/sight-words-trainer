export class SightWordsTrainer {
  constructor(wordLists) {
    this.wordLists = wordLists;
    this.words = []
    this.timings = {}
    this.correctIndex = -1;
    this.promptCount = 0;
    this.lastTime = new Date();
    this.animating = false;
    this.allTimings = this.loadAllTimings();
    this.stopGame();
  }

  loadAllTimings() {
    const storedTimings = localStorage.getItem("storedTimings");
    if (storedTimings) {
      return JSON.parse(storedTimings)
    } else {
      return this.wordLists.map(wordList => {
        return wordList.reduce((obj, word) => {
          obj[word] = 100000
          return obj;
        }, {})
      })
    }
  }

  saveAllTimings() {
    localStorage.setItem("storedTimings", JSON.stringify(this.allTimings));
  }

  getNthWorstWord(wordIndex) {
    const sortedTimings = Object.entries(this.timings).sort(([,a],[,b]) => b-a);
    return sortedTimings[wordIndex][0]
  }

  startGame(wordListIndex) {
    this.words = this.wordLists[wordListIndex]
    this.timings = this.allTimings[wordListIndex]
    this.newWord();
    this.hideOverlay();
  }

  showOverlay() {
    const overlay = document.getElementById('overlay')
    overlay.innerHTML = ''
    overlay.append(...this.wordLists.map((wordList, index) => {
      let result = document.createElement('button')
      result.className = 'wordlist-option'
      result.innerHTML = wordList.map(word => `<div>${word}: ${(this.allTimings[index][word]/1000).toFixed(1)}</div>`).join('')
      result.onclick = () => this.startGame(index)
      return result
    }))
    overlay.style.display = 'grid';
  }

  hideOverlay() {
    document.getElementById('overlay').style.display = 'none';
  }

  stopGame() {
    this.promptCount = 0;
    this.saveAllTimings();
    this.showOverlay();
  }

  newWord() {
    if(this.promptCount >= 10) {
      this.stopGame();
    } else {
      let nextWord = this.getNthWorstWord(0);
      if (this.words.indexOf(nextWord) == this.correctIndex) {
        nextWord = this.getNthWorstWord(1);
      }
      this.correctIndex = this.words.indexOf(nextWord);
      this.speakCurrentWord()
      this.lastTime = new Date();
      this.showWords()
    }
  }

  speakCurrentWord() {
    this.speak(this.words[this.correctIndex])
  }

  flashElement(element, color, callback) {
    const previousBackground = element.style.background
    element.style.background = color
    this.animating = true
    setTimeout(() => {
      this.animating = false
      element.style.background = previousBackground
      callback()
    }, 500);
  }

  checkWord(word, element) {
    if (this.animating) return;
    if (this.words.indexOf(word) != -1 && this.words.indexOf(word) == this.correctIndex) {
      this.promptCount++;
      this.timings[word] = new Date() - this.lastTime;
      this.flashElement(element, 'green', this.newWord.bind(this))
      return true;
    } else {
      this.timings[word] = this.timings[word] + (new Date() - this.lastTime);
      this.flashElement(element, 'red', this.newWord.bind(this))
      return false;
    }
  }

  randomWordThatIsNot(word) {
    let otherWords = this.words.slice()
    otherWords.splice(this.words.indexOf(word), 1)
    return otherWords[Math.floor(Math.random() * otherWords.length)]
  }

  randomIncorrectWord() {
    return this.randomWordThatIsNot(this.correctWord())
  }

  correctWord() {
    return this.words[this.correctIndex]
  }
}
