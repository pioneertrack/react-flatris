// @flow

import React from 'react';
import { createFixture } from '../../../../utils/create-fixture';
import Shake from '../../../effects/Shake';

export default createFixture({
  component: Shake,
  props: {
    children: <em>Crickets ♪</em>,
    time: null
  }
});
