/** @jsx React.DOM */

Flatris.components.FlatrisGame = React.createClass({
  /**
   * The Tetris game was originally designed and programmed by Alexey Pajitnov.
   * It was released on June 6, 1984 and has since become a world-wide
   * phenomenon. Read more about the game at http://en.wikipedia.org/wiki/Tetris
   */
  mixins: [Cosmos.mixins.ComponentTree],

  getInitialState: function() {
    return _.extend(this.getNewGameDefaults(), {
      // Game is stopped by default and there's no Tetrimino to follow
      playing: false,
      nextTetrimino: null
    });
  },

  getNewGameDefaults: function() {
    return {
      playing: true,
      paused: true,
      score: 0,
      lines: 0,
      nextTetrimino: this.getRandomTetriminoType()
    };
  },

  children: {
    well: function() {
      return {
        component: 'Well',
        onTetriminoLanding: this.onTetriminoLanding,
        onFullWell: this.onFullWell
      };
    },

    gamePanel: function() {
      return {
        component: 'GamePanel',
        playing: this.state.playing,
        paused: this.state.paused,
        score: this.state.score,
        lines: this.state.lines,
        nextTetrimino: this.state.nextTetrimino,
        onPressStart: this.start,
        onPressPause: this.pause,
        onPressResume: this.resume
      };
    },

    infoPanel: function() {
      return {
        component: 'InfoPanel'
      };
    }
  },

  render: function() {
    return (
      <div className="flatris-game">
        {this.loadChild('well')}
        {this.renderInfoPanel()}
        {this.loadChild('gamePanel')}
        <div className="controls">
          {React.DOM.button(
            Flatris.attachPointerDownEvent(this.onRotatePress), '↻')}
          {React.DOM.button(
            Flatris.attachPointerDownEvent(this.onLeftPress), '←')}
          {React.DOM.button(
            Flatris.attachPointerDownEvent(this.onRightPress), '→')}
          {React.DOM.button(
            _.extend(
              Flatris.attachPointerDownEvent(this.onPullPress),
              Flatris.attachPointerUpEvent(this.onPullRelease)), '↓')}
        </div>
      </div>
    );
  },

  renderInfoPanel: function() {
    if (!this.state.playing || this.state.paused) {
      return this.loadChild('infoPanel');
    }
  },

  componentDidMount: function() {
    $(window).on('keydown', this.onKeyDown);
    $(window).on('keyup', this.onKeyUp);
  },

  componentWillUnmount: function() {
    $(window).off('keydown', this.onKeyDown);
    $(window).off('keyup', this.onKeyUp);
  },

  start: function() {
    /**
    * Start or restart a Flatris session from scratch.
    */
    var newGameDefaults = this.getNewGameDefaults();
    this.setState(newGameDefaults);
    this.refs.well.reset();
    // setState is always synchronous so we can't read the next Tetrimino from
    // .state.nextTetrimino at this point
    this.insertNextTetriminoInWell(newGameDefaults.nextTetrimino);
    this.resume();
  },

  pause: function() {
    this.setState({paused: true});
    this.refs.well.stopAnimationLoop();
    // Stop any on-going acceleration inside the Well
    this.refs.well.setState({dropAcceleration: false});
  },

  resume: function() {
    this.setState({paused: false});
    this.refs.well.startAnimationLoop();
  },

  onKeyDown: function(e) {
    // Prevent page from scrolling when pressing arrow keys
    if (_.values(Flatris.KEYS).indexOf(e.keyCode) != -1) {
      e.preventDefault();
    }
    // Ignore user events when game is stopped or paused
    if (!this.state.playing || this.state.paused) {
      return;
    }
    switch (e.keyCode) {
    case Flatris.KEYS.DOWN:
      this.refs.well.setState({dropAcceleration: true});
      break;
    case Flatris.KEYS.UP:
      this.refs.well.rotateTetrimino();
      break;
    case Flatris.KEYS.LEFT:
      this.refs.well.moveTetriminoToLeft();
      break;
    case Flatris.KEYS.RIGHT:
      this.refs.well.moveTetriminoToRight();
    }
  },

  onKeyUp: function(e) {
    // Ignore user events when game is stopped or paused
    if (!this.state.playing || this.state.paused) {
      return;
    }
    if (e.keyCode == Flatris.KEYS.DOWN) {
      this.refs.well.setState({dropAcceleration: false});
    }
  },

  onRotatePress: function(e) {
    // Ignore user events when game is stopped or paused
    if (!this.state.playing || this.state.paused) {
      return;
    }
    e.preventDefault();
    this.refs.well.rotateTetrimino();
  },

  onLeftPress: function(e) {
    // Ignore user events when game is stopped or paused
    if (!this.state.playing || this.state.paused) {
      return;
    }
    e.preventDefault();
    this.refs.well.moveTetriminoToLeft();
  },

  onRightPress: function(e) {
    // Ignore user events when game is stopped or paused
    if (!this.state.playing || this.state.paused) {
      return;
    }
    e.preventDefault();
    this.refs.well.moveTetriminoToRight();
  },

  onPullPress: function(e) {
    // Ignore user events when game is stopped or paused
    if (!this.state.playing || this.state.paused) {
      return;
    }
    e.preventDefault();
    this.refs.well.setState({dropAcceleration: true});
  },

  onPullRelease: function(e) {
    // Ignore user events when game is stopped or paused
    if (!this.state.playing || this.state.paused) {
      return;
    }
    e.preventDefault();
    this.refs.well.setState({dropAcceleration: false});
  },

  onTetriminoLanding: function(drop) {
    // Stop inserting Tetriminos and awarding bonuses after game is over
    if (!this.state.playing) {
      return;
    }
    var score = this.state.score,
        lines = this.state.lines,
        level = Math.floor(lines / 10) + 1;

    // Rudimentary scoring logic, no T-Spin and combo bonuses. Read more at
    // http://tetris.wikia.com/wiki/Scoring
    score += drop.hardDrop ? drop.cells * 2 : drop.cells;
    if (drop.lines) {
      score += Flatris.LINE_CLEAR_BONUSES[drop.lines - 1] * level;
      lines += drop.lines;
    }

    // Increase speed with every ten lines cleared (aka level)
    if (Math.floor(lines / 10) + 1 > level &&
        this.refs.well.state.dropFrames > Flatris.DROP_FRAMES_ACCELERATED) {
      this.refs.well.increaseSpeed();
    }

    this.setState({
      score: score,
      lines: lines
    });
    this.insertNextTetriminoInWell(this.state.nextTetrimino);
  },

  onFullWell: function() {
    this.pause();
    this.setState({
      playing: false,
      // There won't be any next Tetrimino when the game is over
      nextTetrimino: null
    });
  },

  insertNextTetriminoInWell: function(nextTetrimino) {
    this.refs.well.loadTetrimino(nextTetrimino);
    this.setState({nextTetrimino: this.getRandomTetriminoType()});
  },

  getRandomTetriminoType: function() {
    return _.sample(_.keys(Flatris.SHAPES));
  }
});
