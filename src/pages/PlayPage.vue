<script lang="ts" setup>
import { reactive, onMounted, onBeforeUnmount } from "vue";
import { Tetromino, TETROMINO_TYPE } from '../common/Tetromino';
import { Field } from '../common/Field';

import TetrominoPreviewComponent from '../components/TetrominoPreviewComponent.vue';

let staticField = new Field();

const tetris = reactive({
  field: new Field(),
});

const tetromino = reactive({
  current: Tetromino.random(),
  position: {x: 3, y: 0},
  next: Tetromino.random(),
});

const classBlockColor = (_x: number, _y: number): string => {
  const type = tetris.field.data[_y][_x];
  if (type > 0) {
    return Tetromino.id(type as TETROMINO_TYPE);
  }

  const { x, y} = tetromino.position;
  const { data } = tetromino.current;

  if (y <= _y && _y < y + data.length) {
    const cols = data[_y - y];

    if (x <= _x && _x < x + cols.length) {
      if ( cols[_x - x] > 0) {
        return Tetromino.id(cols[_x - x] as TETROMINO_TYPE);
      }
    }
  }
  
  return "";
}

/**
 * テトリミノの落下判定を行い真偽値を返却する
 */
const canDropCurrentTetromino = (): boolean => {

  // 落下中のテトリミノの位置を取得する
  const {x, y} = tetromino.position;

  // 落下中のテトリミノの位置より 1 マス下の位置を取得する
  const droppedPosition = {x, y: y + 1};

  // 落下中のテトリミノの位置が 1マス下の位置に移動可能か判定する
  const data = tetromino.current.data;

  return tetris.field.canMove(data, droppedPosition);
}

/**
 * テトリスのフィールドの状態を保存し、
 * 次に落下するテトリミノのフィールドの状態を初期化する
 */
const nextTetrisField = () => {
  // 設置するテトリミノの状態をテトリスのフィールドに反映させる
  const data = tetromino.current.data;
  const position = tetromino.position;

  tetris.field.update(data, position);

  // テトリミノ設置直後のテトリスのフィールドの状態を保存する
  staticField = new Field(tetris.field.data);
  tetris.field = Field.deepCopy(staticField);

  // 次に落下するテトリミノをランダムに設定し、その落下位置を初期化する
  tetromino.current = tetromino.next;
  tetromino.next = Tetromino.random();
  tetromino.position = { x:3, y:0 };
}

const onKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case "Down":
    case "ArrowDown":
      if(canDropCurrentTetromino()) {
        tetromino.position.y++;
        resetDrop();
      } else {
        nextTetrisField();
      }
      break;
    case "Up":
    case "ArrowUp":
      while(canDropCurrentTetromino()) {
        tetromino.position.y++;
        resetDrop();
      }
      nextTetrisField();
      break;
    case "Left":
    case "ArrowLeft": {
      const data = tetromino.current.data;
      const { x, y } = tetromino.position;
      const leftPosition = {x: x - 1, y};
      if(tetris.field.canMove(data, leftPosition)) {
        tetromino.position.x--;
      }
    }
      break;
    case "Right":
    case "ArrowRight": {
      const data = tetromino.current.data;
      const { x, y } = tetromino.position;
      const rightPosition = {x: x + 1, y};
      if(tetris.field.canMove(data, rightPosition)) {
        tetromino.position.x++;
      }
    }
      break;
  }
}

onMounted(function() {
  document.addEventListener('keydown', onKeyDown);
});

onBeforeUnmount(function() {
  document.removeEventListener('keydown', onKeyDown);
});




const resetDropInterval = () => {
  let intervalId = -1;

  return () => {
    if (intervalId !== -1) clearInterval(intervalId);

    intervalId = setInterval(() => {
      tetris.field = Field.deepCopy(staticField);

      if(canDropCurrentTetromino()) {
        tetromino.position.y++;
      } else {
        nextTetrisField();
      }
    }, 1 * 1000);
  };
};

const resetDrop = resetDropInterval();

resetDrop();

tetris.field.update(tetromino.current.data, tetromino.position);

</script>


<template>
  <h1>プレイ画面</h1>
  <h2>ユーザ名: {{ $route.query.name }}</h2>
  <div class="container">
    <div class="tetris">
      <table class="field" style="border-collapse: collapse">
        <tr v-for="(row, y) in tetris.field.data" :key="y">
          <td
            class="block"
            v-for="(col, x) in row"
            :key="() => `${x}${y}`"
            :class="classBlockColor(x, y)"
          />
        </tr>
      </table>
    </div>
    <div class="information">
      <TetrominoPreviewComponent v-bind:tetromino="tetromino.next.data"/>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
   display: flex;
   justify-content: center;
   align-items: stretch;
}
 
 .field {
   border: ridge 0.4em #2c3e50;
   border-top: none;
}
 
.block {
  width: 1em;
  height: 1em;
  border: 0.1px solid #95a5a6;
    /*
    各テトリミノに対応した色を扱うクラス定義
    .block-i, .block-o のようにクラスが定義される
    */
    &-i {
      background: #3498db;
    }
    &-o {
      background: #f1c40f;
    }
    &-t {
      background: #9b59b6;
    }
    &-j {
      background: #1e3799;
    }
    &-l {
      background: #e67e22;
    }
    &-s {
      background: #2ecc71;
    }
    &-z {
      background: #e74c3c;
    }
}

/** テトリスに関する情報をテトリスのフィールドの右に表示する **/
 .information {
   margin-left: 0.5em;
 }
  
</style>