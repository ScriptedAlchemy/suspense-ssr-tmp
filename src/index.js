// This is probably not an ideal way to do runtime SSR, but it
// could be a decent approach for static site generation.
var http = require("http");
var { renderToString } = require("react-dom/server");
var React = require("react");
var Cache = require("react-cache");

const Resource = Cache.unstable_createResource(() =>
  Promise.resolve({ title: "server rendered with suspense!" })
);

function Test() {
  const data = Resource.read();
  return React.createElement("h1", null, data.title);
}

// Recursively renders until there are no more resources to load.
async function render(onComplete) {
  try {
    // You could probably put a styled components server stylesheet
    // here and pass the styles to onComplete.
    const markup = renderToString(React.createElement(Test));
    onComplete(markup);
  } catch (e) {
    // Wait until the resource loads to re-render.
    await e;
    render(onComplete);
  }
}

http
  .createServer(function(req, res) {
    render(markup => {
      res.write(`
      <html><body>${markup}</body></html>
      `);
      res.end();
    });
  })
  .listen(8080);
