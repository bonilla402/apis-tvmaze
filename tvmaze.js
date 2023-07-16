"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $("#episodesList");
const $searchForm = $("#searchForm");



/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {

  const response = await axios.get("http://api.tvmaze.com/search/shows", {
    params: {
      q: term
    }
  });

  console.log(response);

  let shows = [];

  for (const responseEntry of response.data) {

    let newShow = { 
      id: responseEntry.show.id,
      name: responseEntry.show.name,
      summary: responseEntry.show.summary,
      image: responseEntry.show.image ? responseEntry.show.image.medium : "https://tinyurl.com/tv-missing"
    }

    shows.push(newShow);
  }

  return shows;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodesOfShow(id) { 
  
  const episodesData = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);

    return episodesData.data.map(episode => (
      {      
        name:	episode.name,
        season:	episode.season,
        number:	episode.number,
        summary:	episode.summary,
        airdate:	episode.airdate
      }));
    }


 function populateEpisodes(episodes) { 
  $episodesList.empty();

  for (const episode of episodes) {
    $episodesList.append(`<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`);
  } 
 }


async function getEpisodesAndDisplay(evt)
{
  if(evt.target.classList.contains("Show-getEpisodes"))
  {

    const episodesButton = evt.target;
    const showId = episodesButton.closest("[data-show-id]").dataset.showId;
    const episodes = await getEpisodesOfShow(showId);

    if(episodes && episodes.length > 0)
    {
      $episodesArea.css("display", "inline");
      populateEpisodes(episodes);
    }
    else
    {
      $episodesArea.css("display", "none");
    }

  }
  else
  {
    $episodesArea.css("display", "none");
  }
}

$showsList.on("click", getEpisodesAndDisplay);