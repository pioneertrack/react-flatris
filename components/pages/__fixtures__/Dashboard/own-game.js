// @flow

import { createFixture } from '../../../../utils/create-fixture';
import { getSampleUser } from '../../../../utils/test-helpers';
import { getBlankGame } from '../../../../reducers/game';
import Dashboard from '../../Dashboard';

const user1 = getSampleUser();
const game1 = getBlankGame({ id: 'dce6b11e', user: user1 });

export default createFixture({
  component: Dashboard,

  reduxState: {
    jsReady: true,
    curUser: user1,
    games: {
      [game1.id]: game1
    }
  }
});
