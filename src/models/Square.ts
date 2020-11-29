export default class Square {
    public id: string;
    public bonus = '';
    private letter = '';
    private row: number;
    private column: number;

    constructor (id: string, row: number, column: number) {
      this.id = id
      this.row = row
      this.column = column
    }
}
