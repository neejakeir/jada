/**
 * aztaxes-ada.js
 * ADA keyboard fixes for Bootstrap 3.3.0 navigation dropdowns
 * Requires: jQuery 2.1.3, Bootstrap 3.3.0
 */

// Remove Bootstrap 3's built-in arrow-key handler immediately.
// This runs at script parse time — after bootstrap.min.js has loaded
// and registered its handler, but before any $(document).ready fires.
// Placing it inside $(function(){}) risks Bootstrap re-registering after us.
$(document).off('keydown.bs.dropdown.data-api');

$(function () {

  // All three dropdowns
  var dropdowns = [
    { $dd: $('#dd-individual'), $trigger: $('#individual-menu') },
    { $dd: $('#dd-help'),       $trigger: $('#help-menu')       },
    { $dd: $('#dd-azlinks'),    $trigger: $('#azlinks-menu')    }
  ];

  // 2. Sync aria-expanded with Bootstrap open/close events
  $.each(dropdowns, function (i, dd) {
    dd.$dd.on('show.bs.dropdown', function () {
      dd.$trigger.attr('aria-expanded', 'true');
    });
    dd.$dd.on('hide.bs.dropdown', function () {
      dd.$trigger.attr('aria-expanded', 'false');
    });
  });

  // 3. Escape — close whichever dropdown is open, return focus to trigger
  $(document).on('keydown.ada-esc', function (e) {
    if (e.key === 'Escape' || e.keyCode === 27) {
      $.each(dropdowns, function (i, dd) {
        if (dd.$dd.hasClass('open')) {
          dd.$dd.removeClass('open');
          dd.$trigger.attr('aria-expanded', 'false').focus();
        }
      });
    }
  });

  // 4. Arrow keys on trigger — open and focus first or last item
  //    ArrowDown -> first item | ArrowUp -> last item (ARIA APG spec)
  $.each(dropdowns, function (i, dd) {
    dd.$trigger.on('keydown.ada-trigger', function (e) {
      if (e.key === 'ArrowDown' || e.keyCode === 40) {
        e.preventDefault();
        if (!dd.$dd.hasClass('open')) { dd.$trigger.dropdown('toggle'); }
        // setTimeout defers focus until Bootstrap finishes showing the menu
        setTimeout(function () {
          dd.$dd.find('[role="menuitem"]').first().focus();
        }, 0);
      }
      if (e.key === 'ArrowUp' || e.keyCode === 38) {
        e.preventDefault();
        if (!dd.$dd.hasClass('open')) { dd.$trigger.dropdown('toggle'); }
        setTimeout(function () {
          dd.$dd.find('[role="menuitem"]').last().focus();
        }, 0);
      }
    });
  });

  // 5. Arrow keys inside menus — navigate with wrapping.
  //    Delegated from document so it works through Bootstrap's display:none.
  $(document).on('keydown.ada-menu', '.dropdown-menu [role="menuitem"]', function (e) {
    var $menu  = $(this).closest('.dropdown-menu');
    var $items = $menu.find('[role="menuitem"]');
    var idx    = $items.index(this);
    var last   = $items.length - 1;

    if (e.key === 'ArrowDown' || e.keyCode === 40) {
      e.preventDefault();
      $items.eq(idx === last ? 0 : idx + 1).focus(); // wrap: last -> first
    }
    if (e.key === 'ArrowUp' || e.keyCode === 38) {
      e.preventDefault();
      $items.eq(idx === 0 ? last : idx - 1).focus(); // wrap: first -> last
    }
    if (e.key === 'Home') { e.preventDefault(); $items.first().focus(); }
    if (e.key === 'End')  { e.preventDefault(); $items.last().focus();  }
    // Tab NOT handled here — focusout below closes naturally
  });

  // 6. Close when focus truly leaves each dropdown.
  //    requestAnimationFrame defers one frame so the browser has finished
  //    moving focus before we check — prevents premature close on Tab.
  $.each(dropdowns, function (i, dd) {
    dd.$dd.on('focusout.ada-focusout', function () {
      requestAnimationFrame(function () {
        if (dd.$dd.hasClass('open') && !dd.$dd[0].contains(document.activeElement)) {
          dd.$dd.removeClass('open');
          dd.$trigger.attr('aria-expanded', 'false');
        }
      });
    });
  });

});
