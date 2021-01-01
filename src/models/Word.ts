import Square from './Square'

export default class Word {
    public id: number;
    public letters: Square[];
    // public points: number;

    constructor (id: number, letters: Square[]) {
      this.id = id
      this.letters = letters
    }
}
