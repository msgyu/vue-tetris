/**
 * テトリスのフィールドを扱うためのクラス
 */
export class Field {
    
    private field: number[][]

    constructor(data?: number[][]) {
        if(data) {
            this.field = data;
        } else {
            const row = 20;
            const column = 10;

            const data = new Array<Array<number>>(row);

            // 各行に初期値0の配列を挿入
            for (let i = 0; i < row; i++) {
                const fieldColumn = new Array(column).fill(0);
                data[i] = fieldColumn;
            }

            this.field = data;
        }
    }

    get data(): number[][] {
        return this.field;
    }

    update = (data: number[][], position: {x: number, y: number}): void => {
        for(var i = 0; i < data.length; i++) {
            const cols = data[i];
            
            for (var j = 0; j < cols.length; j++) {
                const block = cols[i];
                if (block > 0) {
                    this.field[i + position.y][j + position.x] = block;
                }
            }
        }
    }

    static deepCopy = (field: Field): Field => {
        const data = field.data;
        const newFieldData = new Array<Array<number>>(data.length);

        for (const [i, rows] of data.entries()) {
            newFieldData[i] = new Array(rows.length);

            for (const [j] of rows.entries()) {
                newFieldData[i][j] = data[i][j];
            }
        }

        return new Field(newFieldData);
    }

    canMove = (data: number[][], position: {x: number, y: number}): boolean => {

        /** 移動可能なyの最大値 */
        const moveable_y_max = this.field.length;

        /** 移動可能なxの最大値 */
        const moveable_x_max = this.field[0].length;

        // 移動可能なyを超えた場合、移動不可とする
        if(position.y >= moveable_y_max) return false;

        // テトリスを移動する予定のマス目を1マスずつチェックする。
        // 行数繰り返し処理
        for (var number_line=0; number_line < data.length; number_line++) {
            const rows = data[number_line];
            
            for (var column_number = 0; column_number < rows.length; column_number++) {
                const block = rows[column_number];

                //  テトリミノが描画される予定のマス目（block > 0）のとき
                if (block > 0) {

                    // テトリミノのマス目が、テトリスのフィールドの下にはみ出していないか判定する
                    if (number_line + position.y > moveable_y_max -1) {
                        return false;
                    }

                    // テトリミノのマス目が、テトリスのフィールドの左にはみ出していないか判定する
                    if (0 > column_number + position.x) {
                        return false;
                    }

                    // テトリミノのマス目が、テトリスのフィールドの右にはみ出していないか判定する
                    if (column_number + position.x > moveable_x_max -1) {
                        return false;
                    }
                     
                    // テトリミノのマス目に、他のテトリミノが既に配置されているかどうか判定する
                    if (this.field[number_line + position.y][column_number + position.x] > 0) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

}