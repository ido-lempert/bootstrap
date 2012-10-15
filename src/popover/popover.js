angular.module('ui.bootstrap').directive('bsPopover', 
['$compile', '$interpolate', function($compile, $interpolate) {
  var body = angular.element(document.getElementsByTagName('body')[0]);
  function popPosition(placement, popEl, targetEl) {
    var pop = popEl[0];
    var target = targetEl[0];
    
    var position = {
      left: {
        left: target.offsetLeft - pop.offsetWidth,
        top: target.offsetTop + target.offsetHeight/2 - pop.offsetHeight/2
      },
      top: {
        left: target.offsetLeft - pop.offsetWidth - target.offsetWidth/2,
        top: target.offsetTop - pop.offsetHeight
      },
      right: {
        left: target.offsetLeft + target.offsetWidth,
        top: target.offsetTop - target.offsetHeight - pop.offsetHeight
      },
      bottom: {
        left: target.offsetLeft - pop.offsetWidth - target.offsetWidth/2,
        top: target.offsetTop + target.offsetHeight
      },
      inside: { 
        left: target.offsetLeft,
        top: target.offsetTop
      }
    };
    return position[placement] || position.right;
  }

  var popoverTemplate = '<div class="popover"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content"><p></p></div></div></div>';
   
  return { 
    restrict: 'ECA',
    compile: function(tElement) {
      var popover = angular.element(popoverTemplate);
      var titleEl = popover.find('h3').eq(0);
      
      //Doing manu ltransclusion: probably could be done better
      popover.find('p').html(tElement.html());
      tElement.html('').append(popover);
      
      popover.css('display','none');
      
      return function(scope, elm, attrs) {
        if (!attrs.id) { 
          throw new Error("bs-popover expected id attribute, found none!");
        }
         
        attrs.$observe('title', function(value) {
          titleEl.text(value);
        }); 
      
        function show(targetEl, placement) {
          var pos = popPosition(placement || attrs.placement || 'right',
                                popover, targetEl);
          popover
            .css('left', pos.left + 'px')
            .css('top', pos.top + 'px')
            .css('display', 'block')
            .addClass('in');
        }
        function hide() {
          popover.css('display', 'none').removeClass('in');
        } 
          
        scope.$on('bs.popoverShow', function(evt, popId, targetEl, placement) {
          if (popId === attrs.id) { show(targetEl, placement); }
        });
        scope.$on('bs.popoverHide', function(evt, popId) {
          if (popId === attrs.id) { hide(); }
        });
      };
    }
  }; 
}])
.directive('bsPopTarget', ['$rootScope', '$interpolate', function($rootScope, $interpolate) {
  return {
    restrict: 'CA',
    link: function(scope, elm, attrs) {
      var idAttr = $interpolate(attrs.bsPopTarget);
      scope.$watch(attrs.show, function(shown, oldShown) {
        if (shown !== oldShown) {
          var popId = idAttr(scope);
          if (shown) {
            $rootScope.$broadcast('bs.popoverShow', popId, elm, attrs.placement);
          } else {
            $rootScope.$broadcast('bs.popoverHide', popId);
          }
        }
      });
    }
  };
}]);