// @flow

import { createFixture } from '../../../../utils/create-fixture';
import NewGame from '../../NewGame';

export default createFixture({
  component: NewGame,

  props: {
    disabled: true,
    gameId: '1337',
    onPlay: () => console.log(`Play!`)
  },

  container: {
    width: 10,
    backgroundColor: 'rgba(236, 240, 241, 0.85)'
  }
});
