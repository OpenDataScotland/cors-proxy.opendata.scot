const LOOPBACK_REGEX = /^(https?:\/\/)?(localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d{1,5})?$/;
const WHITELISTED_SITE = "https://opendata.scot";

function isOriginAllowed(origin){
	var regexMatch = LOOPBACK_REGEX.test(origin);
	return origin == WHITELISTED_SITE || regexMatch;
}

// forked from: https://github.com/chebyrash/cors
addEventListener("fetch", event => {
	event.respondWith(handleRequest(event.request))
  })
  
  async function handleRequest(request) {

	var origin = request.headers.get("Origin");
	var originIsAllowed = origin != null && isOriginAllowed(origin);

	if (!originIsAllowed){
		return new Response("Invalid origin", {status: 401});
	}

	try {
	  const url = new URL(request.url);
  
	  if (url.pathname === "/") {
		return new Response(`{"usage": "${url.origin}/<url>"}`);
	  }
  
	  function addHeaders(response) {
		response.headers.set("Access-Control-Allow-Origin", origin);
		response.headers.set("Access-Control-Allow-Credentials", "true");
		response.headers.set("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
		response.headers.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	  }
	  
	  let response;
	  if (request.method == "OPTIONS") {
		response = new Response("");
		addHeaders(response);
		return response;
	  }
  
	  response = await fetch(request.url.slice(url.origin.length + 1), {
		  method: request.method,
		  headers: request.headers,
		  redirect: "follow",
		  body: request.body
	  });
	  response = new Response(response.body, response)
	  addHeaders(response);
	  return response;
	} catch (e) {
	  return new Response(e.stack || e, {status: 500});
	}
  }