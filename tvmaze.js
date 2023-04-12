"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const BASE_URL = "https://api.tvmaze.com";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
async function getShowsByTerm(term) {
  const shows = await axios({
    url: "/search/shows",
    baseURL: BASE_URL,
    method: 'get',
    params: { q: term }
  });

  return shows.data.map((show) => {
    const { id, name, summary, image } = show.show;

    return {
      id,
      name,
      summary,
      image: checkImage(image)
    };
  });
}

/**
 * Returns the medium image if it is present, falling back to the original size image
 * or a stand-in image if none are present.
 * @param {*} image a POJO possibly containing images for the show
 * @returns An image if one was present or a stand-in one
 */
function checkImage(image) {
  if (image === null) {
    return "https://tinyurl.com/tv-missing";
  }

  if (image.medium !== null) {
    return image.medium;
  } else if (image.original) {
    return image.original;
  }

  return "https://tinyurl.com/tv-missing";
}

/** Given list of shows, create markup for each and append to DOM.
 *
 * A show is {id, name, summary, image}
 * */
function displayShows(shows) {
  $showsList.empty();

  for (const show of shows) {
    const $show = $(`
        <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
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

async function searchShowsAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  displayShows(shows);
}

$searchForm.on("submit", async function handleSearchForm(evt) {
  evt.preventDefault();
  await searchShowsAndDisplay();
});

//URL: /shows/:id/episodes

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const episodes = await axios({
    url: `/shows/${id}/episodes`,
    baseURL: BASE_URL,
    method: 'get'
  });

  return episodes.data.map((episode) => {
    const { id, name, season, number } = episode;

    return {
      id,
      name,
      season,
      number
    };
  });
}

/** Write a clear docstring for this function... */

function displayEpisodes(episodes) {
  const $episodesList = $("#episodesList");
  $episodesList.empty();

  for (let episode of episodes) {
    let $episode = $(`<li>${episode.name} (Season ${episode.season}) ${episode.number}</li>`);
    $episodesList.append($episode);
  }

  $episodesArea.show()
}

// add other functions that will be useful / match our structure & design
