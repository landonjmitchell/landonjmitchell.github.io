const base_url = "https://api.themoviedb.org/3/search/movie?api_key=";
const credits_base = "https://api.themoviedb.org/3/movie/"
const tmdb_api_key = "bde024f3eb43f597aafe01ed9c9098c6";

document.addEventListener("DOMContentLoaded", documentReady);

let app = {};

function documentReady() {
  $('#searchform').on("submit", retrieveResults);
}


function retrieveResults(event) {
  event.preventDefault();

  $('#results').html(""); // clear any previous results
  $('#resultlist').html("");

  let search = $('#search').val();
  $('#search').val('');
  let query = search.split(' ').join('+');
  $.get(`${base_url}${tmdb_api_key}&query=${query}`, handleResults).fail(function() {
    alert('Oops! Failed to connect to API server. Please Try again.');
  });
}


function handleResults(data) {
  if (data.results.length == 0) {
    $('#results').html("<h3 class='noresults'>No Matching .</h3>");
    // $('#navbar').hide()
    return;
  }

  for (let item of data.results) {
    if (item.poster_path  != null) {
      $.get(`${credits_base}${item.id}/credits?api_key=${tmdb_api_key}`, function(data) {
            app[`${item.id}_credits`] = data;
            getCreditInfo(item);
          })
    }
  }
  $('#sidebar').show();
}


function getCreditInfo(movie) {
  let directors = [];
  let i = 0;
  for (crew of app[`${movie.id}_credits`].crew) {
    if (crew.job == "Director") {
      directors.push(crew.name);
      i +=1;
      if (directors.length == 5) {
        break;
      }
    }
  }
  if (directors.length == 0) {
    directors.push("N/A");
  }

  let producers = [];
  i = 0;
  for (crew of app[`${movie.id}_credits`].crew) {
    if (crew.job.includes("Producer")) {
      producers.push(crew.name);
      i += 1;
      if (producers.length == 5) {
        break;
      }
    }
  }
  if (producers.length == 0) {
    producers.push("N/A");
  }

  let castList = [];
  i = 0;
  for (cast of app[`${movie.id}_credits`].cast) {
    if (i < 5) {
      castList.push(cast.name)
      i += 1
    } else { break }
  }
  if (castList.length == 0) {
    castList.push("N/A")
  }

  addHtml(movie, directors, producers, castList)
}


function addHtml(movie, directors, producers, castList) {

  $('#results').append(
  `
    <div class="row" id="${movie.id}">

      <div>
        <a href="https://www.themoviedb.org/movie/${movie.id}" target="_blank">
          <div class="col poster" id="${movie.id}_poster">
            <img src="https://image.tmdb.org/t/p/w200/${movie.poster_path}">
          </div></a>
      </div>


      <div class="col info">
        <h2>
          <a href="https://www.themoviedb.org/movie/${movie.id}" targe="_blank">
          ${movie.title} <span class="year">(${movie.release_date.substr(0,4)})
          </a>
        </h2>
        <p class="plot"><strong>Synopsis: </strong>${movie.overview}</p>
      </div>

      <div class="col credits">
        <div>
          <p class="director"><strong>Directed By:</strong> ${directors.join(', ')}</p>
          <p class="director"><strong>Produced By:</strong> ${producers.join(', ')}</p>
          <p class="cast"><strong>Cast:</strong> ${castList.join(', ')}</p>
        </div>
        <div class="return">
          <p class="backtotop mb-1"><a href="#top">Back to top <i class="fas fa-arrow-up"></i></a></p>
        </div>
      </div>
    </div>`
  )

}
