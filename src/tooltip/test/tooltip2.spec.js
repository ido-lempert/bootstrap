describe('tooltip directive', function () {

  var $rootScope, $compile, $document, $timeout;

  beforeEach(module('ui.bootstrap.tooltip'));
  beforeEach(module('template/tooltip/tooltip-popup.html'));
  beforeEach(inject(function (_$rootScope_, _$compile_, _$document_, _$timeout_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $document = _$document_;
    $timeout = _$timeout_;
  }));

  beforeEach(function(){
    this.addMatchers({
      toHaveOpenTooltips: function(noOfOpened) {
        var ttipElements = this.actual.find('div.tooltip');
        noOfOpened = noOfOpened || 1;

        this.message = function() {
          return 'Expected "' + angular.mock.dump(ttipElements) + '" to have "' + ttipElements.length + '" opened tooltips.';
        };

        return ttipElements.length === noOfOpened;
      }
    });
  });

  function compileTooltip(ttipMarkup) {
    var fragment = $compile('<div>'+ttipMarkup+'</div>')($rootScope);
    $rootScope.$digest();
    return fragment;
  }

  function closeTooltip(hostEl, trigger, shouldNotFlush) {
    hostEl.trigger(trigger || 'mouseleave' );
    if (!shouldNotFlush) {
      $timeout.flush();
    }
  }

    function triggerKeyDown(element, key, ctrl) {
        var keyCodes = {
            'enter': 13,
            'space': 32,
            'pageup': 33,
            'pagedown': 34,
            'end': 35,
            'home': 36,
            'left': 37,
            'up': 38,
            'right': 39,
            'down': 40,
            'esc': 27
        };
        var e = $.Event('keydown');
        e.which = keyCodes[key];
        e.keyCode = key;

        if (ctrl) {
            e.ctrlKey = true;
        }
        element.trigger(e);
    }

  describe('basic scenarios with default options', function () {

    it('shows default tooltip on mouse enter and closes on mouse leave', function () {
      var fragment = compileTooltip('<span tooltip="tooltip text">Trigger here</span>');

      fragment.find('span').trigger( 'mouseenter' );
      expect(fragment).toHaveOpenTooltips();

      closeTooltip(fragment.find('span'));
      expect(fragment).not.toHaveOpenTooltips();
    });

    it('should not show a tooltip when its content is empty', function () {
      var fragment = compileTooltip('<span tooltip=""></span>');
      fragment.find('span').trigger( 'mouseenter' );
      expect(fragment).not.toHaveOpenTooltips();
    });

    it('should not show a tooltip when its content becomes empty', function () {

      $rootScope.content = 'some text';
      var fragment = compileTooltip('<span tooltip="{{ content }}"></span>');

      fragment.find('span').trigger( 'mouseenter' );
      expect(fragment).toHaveOpenTooltips();

      $rootScope.content = '';
      $rootScope.$digest();
      $timeout.flush();
      expect(fragment).not.toHaveOpenTooltips();
    });

    it('should update tooltip when its content becomes empty', function () {
      $rootScope.content = 'some text';
      var fragment = compileTooltip('<span tooltip="{{ content }}"></span>');

      $rootScope.content = '';
      $rootScope.$digest();

      fragment.find('span').trigger( 'mouseenter' );
      expect(fragment).not.toHaveOpenTooltips();
    });
  });

  describe('option by option', function () {

    describe('placement', function () {

      it('can specify an alternative, valid placement', function () {
        var fragment = compileTooltip('<span tooltip="tooltip text" tooltip-placement="left">Trigger here</span>');
        fragment.find('span').trigger( 'mouseenter' );

        var ttipElement = fragment.find('div.tooltip');
        expect(fragment).toHaveOpenTooltips();
        expect(ttipElement).toHaveClass('left');

        closeTooltip(fragment.find('span'));
        expect(fragment).not.toHaveOpenTooltips();
      });

    });

  });

  it('should show even after close trigger is called multiple times - issue #1847', function () {
    var fragment = compileTooltip('<span tooltip="tooltip text">Trigger here</span>');

    fragment.find('span').trigger( 'mouseenter' );
    expect(fragment).toHaveOpenTooltips();

    closeTooltip(fragment.find('span'), null, true);
    // Close trigger is called again before timer completes
    // The close trigger can be called any number of times (even after close has already been called)
    // since users can trigger the hide triggers manually.
    closeTooltip(fragment.find('span'), null, true);
    expect(fragment).toHaveOpenTooltips();

    fragment.find('span').trigger( 'mouseenter' );
    expect(fragment).toHaveOpenTooltips();

    $timeout.flush();
    expect(fragment).toHaveOpenTooltips();
  });

  it('should hide even after show trigger is called multiple times', function () {
    var fragment = compileTooltip('<span tooltip="tooltip text" tooltip-popup-delay="1000">Trigger here</span>');

    fragment.find('span').trigger( 'mouseenter' );
    fragment.find('span').trigger( 'mouseenter' );

    closeTooltip(fragment.find('span'));
    expect(fragment).not.toHaveOpenTooltips();
  });

    it('should have WAI-ARIA support', function () {
        var fragment = compileTooltip('<span tooltip="tooltip text">Trigger here</span>');
        var tooltip = fragment.find('span');
        tooltip.trigger( 'mouseenter' );

        expect(tooltip.attr('role')).toBe('tooltip');
        expect(tooltip.attr('tabindex')).toBe('0');
        expect(tooltip.attr('aria-describedby')).toBeDefined();

        var tooltipPopup = fragment.find('div.tooltip');
        expect(tooltipPopup.length).toBe(1);
        expect(tooltipPopup.attr('id')).toBe(tooltip.attr('aria-describedby'));
        expect(tooltipPopup.attr('tabindex')).toBe('-1');

        expect(fragment).toHaveOpenTooltips();

        triggerKeyDown(tooltip, 27);
        $timeout.flush();
        expect(fragment).not.toHaveOpenTooltips();
    });

});