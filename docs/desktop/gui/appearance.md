# Appearance

## What is it?

An appearance theme is the main part of the theme. It contains all appearance
definitions which are responsible for holding all styling information for the
widgets. Usually the appearance theme is the biggest theme and uses all other
theme classes like the Decorator- or Font-theme.

## Theme Structure

A theme normally consists of a set of entries. Each entry has a key which is
basically some kind of selector which matches to a specific widget. Missing
selectors are presented as a warning when developing with debug code enabled.

```javascript
qx.Theme.define("qx.theme.modern.Appearance",
{
  appearances :
  {
    selector : entry,
    [...]
  }
});
```

## Selectors

In the most basic form each selector is identical to an appearance ID. This
appearance ID is the value stored in the `appearance` property (
[API](apps://apiviewer/#qx.ui.core.Widget~appearance)) of each widget.

The child control system ignores this appearance entry for widgets which
function as a child control of another widget. In these cases the selector is
the combination of the appearance ID of the parent widget plus the ID of the
child control.

In a classic `Button` there is a child control `icon` for example. The
appearance selector for the image element which represents the icon is
`button/icon`. As you can see the divider between the appearance ID and the
child control is a simple slash (`/`).

It is also possible that a widget, which is a child control itself, uses another
child control. Generally the mechanism prepends the ID of each parent which is
also a child control to the front of the selector. For example:

```
- pane
  - level1
    - level2
      - level3
```

the generated selector would be `pane/level1/level2/level3`. For `pane` which is
not a child control of any other widget the appearance ID is used. For all
others the child control ID is used. Again `pane` is not managed by any other
widget so it is basically added by the developer of the application to another
widget while `level1` to `level3` are managed by some type of combined widget
and are added to each other without the work of the application developer.

A classic example for this is the `Spinner` widget. A `Spinner` is basically a
Grid layout with a `TextField` and two `RepeatButtons`. The three internal
widgets are available under the sub control IDs `textfield`, `upbutton` and
`downbutton`. The selectors for these kind of child controls are then:

- `spinner/textfield`
- `spinner/upbutton`
- `spinner/downbutton`

Each of these selectors must be defined by the selected appearance. Otherwise a
warning about missing selectors is displayed.

## Aliases

A entry can be defined with two different values, a string or a map. The first
option is named "alias", it is basically a string, redirecting to another
selector. In the `Spinner` example from above we may just want to use aliases
for the buttons. See the example:

```javascript
qx.Theme.define("qx.theme.modern.Appearance",
{
  appearances :
  {
    [...],

    "spinner/upbutton" : "button",
    "spinner/downbutton" : "button",

    [...]
  }
});
```

So we have mastered one essential part for appearance themes. It is basically
the easiest part, but seen quite often. Compared to CSS you always have a full
control about the styling of such an child control. There is no type of implicit
inheritance. This may also be seen negatively, but most developers tend to like
it more.

Such an alias also redirects all child controls of the left hand selector to the
right hand selector. This means that the icon inside the button is automatically
redirected as well. Internally this mapping looks like this:

```
"spinner/upbutton" => "button"
"spinner/upbutton/icon" => "button/icon"
"spinner/upbutton/label" => "button/label"
```

This is super convenient for simple cases and additionally it is still possible
to selectively override definitions for specific child controls.

```javascript
qx.Theme.define("qx.theme.modern.Appearance",
{
  appearances :
  {
    [...],

    "myimage" : [...],

    "spinner/upbutton" : "button",
    "spinner/upbutton/icon" : "myimage",

    [...]
  }
});
```

Internally the above results into the following remapping:

```
"spinner/upbutton" => "button"
"spinner/upbutton/icon" => "myimage"
"spinner/upbutton/label" => "button/label"
```

## Entries

The more complex full entry is a map with several sub entries where all are
optional:

```javascript
qx.Theme.define("qx.theme.modern.Appearance",
{
  appearances :
  {
    [...],

    "spinner/textfield" :
    {
      base : true/false,
      include : String,
      alias : String,

      style : function(states, styles)
      {
        return {
          property : states.hovered ? value1 : value2,
          [...]
        };
      }
    },

    [...]
  }
});
```

### Style Method

Let's start with the `style` sub entry. The value under this key should be a
function which returns a set of properties to apply to the target widget. The
first parameter of the function is named `states`. This is a map containing keys
with boolean values which signalize which states are switched on. The data could
be used to react on specific states like `hovered`, `focused`, `selected`, etc.
The second parameter `styles` is only available if a `include` key is given. If
so, the `styles` parameter contains the styles of the included appearance. This
may be very handy if you just want to add some padding and don't want to change
it completely. In any case, you don't need to return the given styles. The
returned styles and the `styles` argument will be merged by the appearance
manager with a higher priority for the local (returned) styles.

It is required that all properties applied in one state are applied in all other
states. Something like this is seen as bad style and may result in wrong
styling:

```javascript
style : function(states)
{
  var result = {};

  if (states.hovered) {
    result.backgroundColor = "red";
  }
  // BAD: backgroundColor missing when widget isn't hovered!

  return result;
}
```

Instead, you should always define the else case:

```javascript
style : function(states)
{
  var result = {};

  if (states.hovered) {
    result.backgroundColor = "red";
  } else {
    // GOOD: there should be a setting for all possible states
    result.backgroundColor = undefined;
  }

  return result;
}
```

<div class="note">

<div class="admonition-title">

Note

</div>

The `undefined` value means that no value should be applied. When Qooxdoo runs
through the returned map it calls the `reset` method for properties with a value
of `undefined`. In most cases it would be also perfectly valid to use `null`
instead of `undefined`, but keep in mind that `null` is stored using the setter
(explicit null) and this way it overrides values given through the inheritance
or through the init values. In short this means that `undefined` is the better
choice in almost all cases.

</div>

One thing we have also seen in the example is that it is perfectly possible to
create the return map using standard JavaScript and fill in keys during the
runtime of the `style` method. This allows to use more complex statements to
solve the requirements of today's themes were a lot of states or dependencies
between states can have great impact on the result map.


### Child Control Aliases

Child control aliases are compared to the normal aliases mentioned above but only
define aliases for the child controls. They do not redirect the parent selector
to the selector defined by the alias. An example to make this more clear is shown
below.

```javascript
qx.Theme.define("qx.theme.classic.Appearance",
{
  appearances :
  {
    [...],
    

    "dialog": {
        alias: "window",

        style: function(states) {
          return {
            contentPadding: 10,
            padding: 10,
          };
        },
      },

    [...]
  }
});
```


The result mapping would look like the following:

```
"dialog" => "dialog"
"dialog/captionbar" => "window/captionbar"
"dialog/close-button" => "window/close-button"
etc...
```
and the resulting widget looks like this

![Widget with alias](appearance/widget_with_alias.png)

The blue widget inside the window is irrelevant to the code and it is there for 
display purposes.

As you can see, the original `dialog` selector is not redirected to 
the `window` selector. Only the child controls are redirected to 
their respective child control styles. The `dialog` widget
is styled with the returned map from the `style` function.  This allows
one to just refine a specific outer part of a complex widget instead of the
whole widget.

It is also possible to include the original styling of the `window` selector
into the `dialog` as well. In this case the styling of the `window` selector is
applied to the `dialog` selector but it also gives the ability to override
some styling properties.

```javascript
qx.Theme.define("qx.theme.classic.Appearance",
{
  appearances :
  {
    [...],


    "dialog": {
        alias: "window",
        include: "window",

        style: function(states) {
          return {
            contentPadding: 10,
            padding: 10,
          };
        },
      },

    [...]
  }
});
```

![Widget with alias and include](appearance/widget_with_alias_and_include.png)

When `alias` and `include` are identically pointing to the same selector the
result is the same as the string alias.

### Includes

Includes are used to reuse the result of another key and merge it with the local
data. Includes may also be used standalone without the `style` key but this is
merely the same like an alias. An alias is the faster and better choice in this
case.

The results of the include block are merged with lower priority than the local
data so it just gets added to the map. To remove a key from the included map
just define the key locally as well (using the `style` method) and set it to
`undefined`.

Includes do nothing to child controls. They just include exactly the given
selector into the current selector. Here is our `dialog` example using only 
the `include` key

```javascript
qx.Theme.define("qx.theme.classic.Appearance",
{
  appearances :
  {
    [...],


    "dialog": {
        include: "window",

        style: function(states) {
          return {
            contentPadding: 10,
            padding: 10,
          };
        },
      },

    [...]
  }
});
```

![Widget with include](appearance/widget_with_include.png)

The widget itself is styled but it's child controls didn't receive any
styling.

### Base Calls

When extending themes the so-named `base` flag can be enabled to include the
result of this selector of the derived theme into the local selector. This is
quite comparable to the `super(...)` call in member functions of
typical Qooxdoo classes. It does all the things the super class has done plus
the local things. Please note that all local definitions have higher priority
than the inheritance. See next paragraph for details.

### Priorities

Priority is quite an important topic when dealing with so many sources to fill a
selector with styles. Logically the definitions of the `style` function are the
ones with the highest priority followed by the `include` block. The least
priority has the `base` flag for enabling the _base calls_ in inherited themes.

## States

A state is used for every visual state a widget may have. Every state has flag
character. It could only be enabled or disabled via the API `addState` or
`removeState`.

## Performance

Qooxdoo has a lot of impressive caching ideas behind the whole appearance
handling. As one could easily imagine all these features are quite expensive
when they are made on every widget instance and more important, each time a
state is modified.

### Appearance Queue

First of all we have the appearance queue. Widgets which are visible and
inserted into a visible parent are automatically processed by this queue when
changes happen or on the initial display of the widget. Otherwise the change is
delayed until the widget gets visible (again).

The queue also minimizes the effect of multiple state changes when they happen
at once. All changes are combined into one lookup to the theme e.g. changing
`hovered` and `focused` directly after each other would only result into one
update instead of two. In a modern GUI typically each tap influence a few
widgets at once and in these widgets a few states at once so this optimization
really pays of.

### Selector Caching

Each widget comes with an appearance or was created as a child control of
another widget. Because the detection of the selector is quite complex with
iterations up to the parent chain, the resulting selector of each widget is
cached. The system benefits from the idea that child controls are never moved
outside the parent they belong to. So a child controls which is cached once
keeps the selector for lifetime. The only thing which could invalidate the
selectors of a widget and all of its child controls is the change of the
property `appearance` in the parent of the child control.

### Alias Caching

The support for aliases is resolved once per application load. So after a while
all aliases are resolved to their final destination. This process is lazy and
fills the redirection map with selector usage. This means that the relatively
complex process of resolving all aliases is only done once.

The list of resolved aliases can be seen when printing out the map under
`qx.theme.manager.Appearance.getInstance().__aliasMap` to the log console. It
just contains the fully resolved alias (aliases may redirect to each other as
well).

### Result Caching

Further the result of each selector for a specific set of states is cached as
well. This is maybe the most massive source of performance tweaks in the system.
With the first usage, Qooxdoo caches for example the result of `button` with the
states `hovered` and `focused`. The result is used for any further request for
such an appearance with the identical set of states. This caching is by the way
the most evident reason why the appearance has no access to the individual
widget. This would interfere with the caching in some way.

This last caching also reduces the overhead of `include` and `base` statements
which are quite intensive tasks because of the map merge character with which
they have been implemented.
