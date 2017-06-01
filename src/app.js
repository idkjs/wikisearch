const $ = require("jquery");
const R = require("ramda");
const Spinner = require('./spinner.min');

//    go through the elements and create a node for each. this is looking for an array
//    but we dont have to have that. lets keep it to reuse on other data.
function createWeatherElements(
    createElement,
    createWeatherTemplate,
    locations
) {
    return locations
        .filter(location => location.size !== null && location.size !== undefined)
        .map(createWeatherTemplate)
        .map(createElement);
}

function createWeatherTemplate(location) {
    return `<blockquote class="pv3 bb last-child-no-bb b--black nested-copy-line-height" data-location-id="${location.size}">
      <h2><span class="ttu">${location.title}</span><a class="link dib dim fw4 black ml3 f6 v-mid" href="https://en.wikipedia.org/wiki/${location.title}" target="_blank"><span class="bb dib">Source</span><span class="dib rotate-315">→</span></h2>
      <footer class="list ma0 pa0 flex flex-wrap">${location.snippet}</footer>
    </blockquote>
  `;
}

function clearElement(id) {
    document.getElementById(id).innerHTML = "";
}

function appendElementToParent(parent, el) {
    document.getElementById(parent).appendChild(el.content.firstElementChild);
}

//      create and element for each element in returned data
function createElement(template) {
    const el = document.createElement("template");
    el.innerHTML = template;
    return el;
}

function processSearchResponse(response) {
    let results = response.query.search;
    clearElement("app");
    const elements = results.length > 0 ?
        createWeatherElements(createElement, createWeatherTemplate, results) : [console.log("error in processSearchResults")];
    elements.forEach(el => appendElementToParent("app", el));
}

const log = R.curry((prefix, data) => console.log(prefix, data));

// getValue :: String -> String
function getValue(id) {
    return $(`#${id}`).val();
}

function removeTagFromBody(isTagOnPage, removeTag, tag) {
    if (isTagOnPage(tag)) {
        removeTag(tag);
    }
}

function removeTag(tag) {
    $(`${tag}`).remove()
    const results = document.getElementsByTagName(tag).length
}

function isTagOnPage(tag) {
    return document.getElementsByTagName(tag).length > 0
}

$("#target").submit(function() {
    const tag = 'blockquote'
    const target = document.getElementById('app')
    removeTagFromBody(isTagOnPage, removeTag, tag)
        // this violates functional: refactor
    const spinner = new Spinner().spin(target);

});

// getJson :: (Event -> String) -> (a -> *) -> Event -> *
const getJson = R.curry((urlBuilder, processResult, e) => {
    $.getJSON(urlBuilder(e))
        .done(processResult)
        .fail(err => log("Search Error Log:", err));
});

// searchUrl :: (String -> String) -> String -> Event -> String
const searchUrl = R.curry((getValue, e) => {
    return `https://crossorigin.me/https://en.wikipedia.org/w/api.php?action=query&titles&list=search&format=json&srsearch=${getValue("search")}`;
});

// searchForMovies :: Event -> *
const searchWiki = getJson(searchUrl(getValue), processSearchResponse);
const isNotEmpty = R.compose(R.not, R.isEmpty);
window.searchIfNotEmpty = R.ifElse(
    isNotEmpty,
    searchWiki,
    log("a search term should be" + " provided")
);