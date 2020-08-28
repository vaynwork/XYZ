let z = {

  set: {
    script(src) {
      let script = document.createElement('script');
      script.src = src;
      document.head.append(script);
    },
    css(src) {
      let link = document.createElement('link');
      link.href = src;
      link.rel = "stylesheet";
      document.head.append(link);
    },
    json(src) {
      fetch(src + '.json')
      .then(response => response.json())
      .then(data => zdata = data)
      .catch(console.error);
    },
    theme() {
      const element = $q('html');

      if (zdata.theme === undefined) {
        element.classList.add(`default`);
      } else if (zdata.theme === "none") {
        return;
      } else {
        element.classList.add(`${zdata.theme}`)
      }
    },
    design() {
      const element = $q('body');

      if (zdata.design != undefined) {
        element.classList.add(`use-layout`);
        element.classList.add(`${zdata.design}`);
      }
    },
    title() {
      if (zdata.pageName !== undefined) {
        document.title = `${zdata.pageName} - ${zdata.siteName}`;
        zoon.cnsl.log('Title set');
      } else {
        return;
      }
    },
    head() {
      let zoonHead = $q('head')

      // Inserts HEAD file
      fetch('/assets/html/head.html')
      .catch((err) => {
        zoon.cnsl.log('Error fetching head')
      })
      .then(response => response.text())
      .then(text => {
        zoonHead.insertAdjacentHTML('beforeend', text)
      })
    },
    layout(url) {
      let currentLayout
      let layout = zdata.layout;
      let zoonBody = $q('body')

      // Inserts Layout file
      if (layout === undefined) {
        currentLayout = "default"
        fetch(url + 'default.html')
        .catch((err) => {
          zoon.cnsl.log('Error fetching layout')
        })
        .then(response => response.text())
        .then(text => {
          zoonBody.insertAdjacentHTML('beforeend', text)
        })
        zoon.cnsl.log('Layout = default');
      } else {
        currentLayout = layout
        fetch(url + layout + '.html')
        .catch((err) => {
          zoon.cnsl.log('Error fetching layout')
        })
        .then(response => response.text())
        .then(text => {
          zoonBody.insertAdjacentHTML('beforeend', text)
        })
        zoon.cnsl.log('Layout = ' + layout);
      }
    },
  },

  pull_json(src) {
    let json_data
    fetch(src)
    .then(response => response.json())
    .then(data => json_data = data)
    .catch(console.error);
    zoon.cnsl.log(json_data)
    return json_data;
  },

  pageBuild() {
    z.set.theme();
    z.set.design();
    z.set.title();
    if (zdata.layout !== "0") {
      z.set.layout('/assets/html/layouts/');
    }
    zoon.cnsl.log('Page succesfully built');
  },

  update(id, path) {
    let entity = $q('#pageSelect').value;
    $q(id).setAttribute('src', path + entity);
  },

  loadPage(page) {
    $q('z-html').setAttribute('src', page);
  }
}

let zoon = {

  cnsl: {

    log(text) {
      const font_size = 'font-size:15px;'
      // Log types
      const log = 'color:#888;' + font_size
      // Styling the zoon tag
      const tag_color = 'color:#ab4cef;font-size:15px;'
      // zoon tag at the start of a message
      const zoonTag = '%c[zoon]%c %s'
      // Sending the message to the log
      console.log(zoonTag, tag_color, log, text);
    },

    help() {
      zoon.cnsl.log(`this is a help command :)`)
    },

    zdata() {
      for (const [key, value] of Object.entries(zdata)) {
        zoon.cnsl.log(`${key}: ${value}`);
      }
    }
  }
}

let zdata

// Functions
const $q = document.querySelector.bind(document);
const $qa = (css, parent = document) => Array.from(parent.querySelectorAll(css));

// CUSTOM ELEMENTS
class ZoonData extends HTMLElement {
  connectedCallback() {
    let self = this;
    let str = this.innerHTML;

    str = str.replace(/(\n)+/g, '", "').replace(/( = )+/g, '":"').slice(0, -3).slice(2);
    str = `{${str}}`

    let finalString = JSON.parse(str);
    Object.assign(zdata, finalString)
    console.log(finalString);
    self.remove();
  }
}

class ZoonTime extends HTMLElement {
  connectedCallback() {
    let date = new Date(this.getAttribute('datetime') || Date.now());
    this.innerHTML = new Intl.DateTimeFormat("default", {
      year: this.getAttribute('year') || undefined,
      month: this.getAttribute('month') || undefined,
      day: this.getAttribute('day') || undefined,
      hour: this.getAttribute('hour') || undefined,
      minute: this.getAttribute('minute') || undefined,
      second: this.getAttribute('second') || undefined,
      timeZoneName: this.getAttribute('time-zone-name') || undefined,
    }).format(date);
  }
}

class ZoonVariable extends HTMLElement {
  connectedCallback() {
    this.setContents();
  }
  setContents() {
    object = this.getAttribute('object');
    this.innerHTML = zdata[this.getAttribute('var')] || "";
  }
}

class ZoonNavbar extends HTMLElement {
  connectedCallback() {
    this.setCurrentPage();
  }
  setCurrentPage() {
    let current_location = location.pathname;
    if (current_location === "/") return;
    let nav_items = this.getElementsByTagName("a");
    for (let i = 0, len = nav_items.length; i < len; i++) {
      if (nav_items[i].getAttribute("href").indexOf(current_location) !== -1) {
        nav_items[i].className = "current-page";
      }
    }
  }
  setupLinks() {
    let nav_items = this.getElementsByTagName("a");
    for (let i = 0, len = nav_items.length; i < len; i++) {
      if (nav_items[i].getAttribute("href").indexOf(current_location) !== -1) {
        nav_items[i].className = "current-page";
      }
    }
  }
}

class ZoonLogo extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<a href="https://zoon.vuw.nu">zoon</a>';
  }
}

class ZoonHTML extends HTMLElement {
  connectedCallback() {
    if (this.hasAttribute('src')) {
      this.setFromSource();
    } else if (this.hasAttribute('key')) {
      this.setFromURL();
    }
  }
  setFromSource() {
    fetch(this.getAttribute('src'))
      .then(response => response.text())
      .then(text => {
        this.innerHTML = text
      });
  }
  setFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const source = this.getAttribute('src');
    const key = this.getAttribute('key');
    const pathValue = window.location.pathname;
    const queryValue = urlParams.get(key);

    fetch(source + queryValue)
      .then(response => response.text())
      .then(text => {
        this.innerHTML = text
      });
  }
  attributeChangedCallback(name, oldValue, newValue) {
    this.setContent();
  }
  static get observedAttributes() {
    return ['src'];
  }
}

class ZoonQuery extends HTMLElement {
  connectedCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const source = this.getAttribute('src');
    const key = this.getAttribute('key');
    
    const pathValue = window.location.pathname;
    const queryValue = urlParams.get(key);

    if (queryValue === null) {
      return;
    } else {
    fetch(source + queryValue)
      .then(response => response.text())
      .then(text => {
        this.innerHTML = text
      });
    }
  }
}

class ZoonInsert extends HTMLElement {
  connectedCallback() {
    const output = $q('z-insert');
    const input = $q(this.getAttribute('input'));

    while (input.childNodes.length > 0) {
      output.appendChild(input.childNodes[0]);
    }
    input.remove();
  }
}

class ZoonTable extends HTMLElement {
  connectedCallback() {
    let source = this.getAttribute('src');

    fetch(source)
      .then(response => response.text())
      .then(text => {
        this.innerHTML = text
      });
  }
}

class ZoonCard extends HTMLElement {
  connectedCallback() {
    let tmpl = $q('#' + this.getAttribute('src'));

    this.attachShadow({mode: 'open'}).append(tmpl.content.cloneNode(true));
  }
}

class ZoonLightswitch extends HTMLElement {
  connectedCallback() {
    this.init();
    this.addEventListener('click', function() {
      this.toggle();
    }, false);
  }
  init() {
    const target = $q('#' + this.getAttribute('target'));
    if (window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches) {
      target.classList.add(`lightswitch-off`);
    } else {
      target.classList.add(`lightswitch-on`);
    }
  }
  toggle() {
    const target = $q('#' + this.getAttribute('target'));
    if (target.classList.contains(`lightswitch-off`)) {
      this.turnOn();
    } else {
      this.turnOff();
    }
  }
  turnOn() {
    target.classList.replace(`lightswitch-off`, `lightswitch-on`);
  }
  turnOff() {
    target.classList.replace(`lightswitch-on`, `lightswitch-off`);
  }
}

class ZoonObject extends HTMLElement {
  connectedCallback() {
    this.setupObject();
  }
  setupObject() {
    let src = this.getAttribute('src');
    fetch(src)
      .then(response => response.json())
      .then(data => this.getAttribute('object') = data)
      .catch(console.error);
  }
}

class ZoonContent extends HTMLElement {
  connectedCallback() {
    this.setHTML();
    if (this.getAttribute('page')) {
      this.setContent();
    } else {
      
    }
  }
  setHTML() {
    const source = this.getAttribute('src')

    fetch(source)
      .then(response => response.text())
      .then(text => {
        this.innerHTML = text
      });
  }
  attributeChangedCallback(name, oldValue, newValue) {
    this.setContent();
  }
  static get observedAttributes() {
    return ['src'];
  }
  searchParams() {
    const source = this.getAttribute('src')
    const key = this.getAttribute('key')
    const urlParams = new URLSearchParams(window.location.search);
    const value = urlParams.get(key)

    if (value === null) {
      return;
    } else {
    fetch(source + value)
      .then(response => response.text())
      .then(text => {
        this.innerHTML = text
      });
    }
  }
}

// Defining all custom elements
function defineElements() {
  customElements.define("z-data", ZoonData);
  customElements.define("z-object", ZoonObject);
  customElements.define("z-time", ZoonTime);
  customElements.define("z-nav", ZoonNavbar);
  customElements.define("zoon-logo", ZoonLogo);
  customElements.define("z-query", ZoonQuery);
  customElements.define("z-insert", ZoonInsert);
  customElements.define("z-html", ZoonHTML);
  customElements.define("z-template", ZoonCard);
  customElements.define("z-lightswitch", ZoonLightswitch);

  setTimeout(() => {
    customElements.define("z-var", ZoonVariable);
  }, 100);

}

// Single Page Apps for GitHub Pages
// https://github.com/rafrex/spa-github-pages
// Copyright (c) 2016 Rafael Pedicini, licensed under the MIT License
// ----------------------------------------------------------------------
// This script checks to see if a redirect is present in the query string
// and converts it back into the correct url and adds it to the
// browser's history using window.history.replaceState(...),
// which won't cause the browser to attempt to load the new url.
// When the single page app is loaded further down in this file,
// the correct url will be waiting in the browser's history for
// the single page app to route accordingly.
(function(l) {
  if (l.search) {
    var q = {};
    l.search.slice(1).split('&').forEach(function(v) {
      var a = v.split('=');
      q[a[0]] = a.slice(1).join('=').replace(/~and~/g, '&');
    });
    if (q.p !== undefined) {
      window.history.replaceState(null, null,
        l.pathname.slice(0, -1) + (q.p || '') +
        (q.q ? ('?' + q.q) : '') +
        l.hash
      );
    }
  }
}(window.location));

(function () {
  z.set.css('https://cdn.jsdelivr.net/gh/vuwnu/zoon@master/zoon.css');
  fetch('/zdata.json')
  .then(response => response.json())
  .then(data => zdata = data)
  .catch(console.error);
})();

function setup() {
  defineElements();
  z.pageBuild();
  zoon.cnsl.log(`zoon has loaded for ${zdata.siteName}`);
}

//// INITIALISATION
window.addEventListener('load', (event) => {
  setTimeout(() => {
    setup();
  }, 100);
});
