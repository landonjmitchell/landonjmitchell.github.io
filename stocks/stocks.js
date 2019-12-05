const base_url = "https://cloud.iexapis.com/beta/stock";
const token = 'pk_86983827efc047be990fe294ab336606';

document.addEventListener("DOMContentLoaded", documentReady);

let app = {};

function documentReady() {
  $('#buyForm').on("submit", buy);
  $('#sellForm').on("submit", sell);
  $('#symbolHeader, #sharesHeader, #priceHeader, #totalHeader').on('click', getSortType);
  $('#refresh').on('click', updatePortfolio)

  if (typeof localStorage !== 'undefined') {
    stringApp = localStorage.getItem('app');
    if (stringApp != null) {
      app = JSON.parse(stringApp);
    } else {
      app.portfolio = [];
      app.updated = 0
      app.total = 0
      app.sortType = 'symbol_ascending'
    }
    sortStocks()
  }
}

function buy(event) {
  event.preventDefault()

  $('#tradeError').hide()

  let values = validateInput()

  if (values.valid === true) {
    $.get(`${base_url}/${values.symbol}/quote?token=${token}`, function(data) { handleBuy(data, values)}).fail(function() {
        $('#tradeError p').html("No matching stock symbol found.");
        $('#tradeError').slideDown("slow")});
    }
}

function validateInput() {
  let symbol = $('#buySymbol').val().toUpperCase();
  let shares = $('#buyShares').val();

  if (symbol === '') {
    $('#tradeError p').html("Must enter a stock symbol");
    $('#tradeError').slideDown("slow");
    return {valid: false, 'symbol': symbol, 'shares': shares}
  }

  if (!$.isNumeric(shares) || (+shares < 0)) {
    $('#tradeError p').html("Must enter a postive number of shares");
    $('#tradeError').slideDown("slow");
    return {valid: false, 'symbol': symbol, 'shares': shares}
  }

  return {valid: true, 'symbol': symbol, 'shares': +shares};
}

function handleBuy(data, values) {
  $('#buySymbol').val('');
  $('#buyShares').val('');

  let symbol = values.symbol
  let shares = values.shares
  let price = data.latestPrice
  let stock = {'symbol': symbol, 'shares': shares, 'price': price}

  var result = $.grep(app.portfolio, function(s){ return s.symbol === symbol; });
  if (result.length > 0) {
    stock = result[0]
    stock.shares += shares;
  } else {
    app.portfolio.push(stock)
  }
  updatePortfolio()
}

function addToTable(stock) {
  if($(`#${stock.symbol}`).length != 0) {
    $(`#${stock.symbol}`).remove()
  }

  let stock_total = stock.shares * stock.price
  $('#portfolioBody').append(`<tr id="${stock.symbol}">
                                <th scope="row">${stock.symbol}</th>
                                  <td>${stock.shares}</td>
                                  <td>$${stock.price.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                                  <td>$${stock_total.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                              </tr>`)
}

function sell(event) {
  event.preventDefault();
  $('#tradeError').hide();

  let symbol = $('#sellSymbol').val().toUpperCase();
  let shares = $('#sellShares').val();

  if ((!$.isNumeric(shares)) || (+shares < 0)) {
    $('#tradeError p').html("Must enter a positive number of shares");
    $('#tradeError').slideDown("slow");
    return;
  }

  let result = $.grep(app.portfolio, function(s){ return s.symbol === symbol; });
  if (result.length < 1) {
    $('#tradeError p').html("You don't own any shares matching that symbol");
    $('#tradeError').slideDown("slow");
    return;
  } else {
    let stock = result[0];
    if (shares > stock.shares) {
      $('#tradeError p').html("You don't own that many shares of this stock");
      $('#tradeError').slideDown("slow");
      return;
    } else {
      stock.shares -= shares;
    }

    if (stock.shares === 0) {
      app.portfolio = $.grep(app.portfolio, function(e){
        return e.symbol != symbol; });
      $(`#${symbol}`).remove();
    }

    $('#sellSymbol').val('');
    $('#sellShares').val('');
    updatePortfolio()

  }
}

function getSortType(event) {
  let id = event.target.id;
  switch (id) {
    case 'symbolHeader':
      if (app.sortType === 'symbol_ascending') {
        app.sortType = 'symbol_descending';
        break
      } else {
        app.sortType = 'symbol_ascending';
        break
      }
    case 'sharesHeader':
      if (app.sortType === 'shares_ascending') {
        app.sortType = 'shares_descending';
        break
      } else {
        app.sortType = 'shares_ascending';
        break
      }
    case 'priceHeader':
      if (app.sortType === 'price_ascending') {
        app.sortType = 'price_descending';
        break
      } else {
        app.sortType = 'price_ascending';
        break
      }
    case 'totalHeader':
      if (app.sortType === 'value_ascending') {
        app.sortType = 'value_descending';
        break
      } else {
        app.sortType = 'value_ascending';
        break
      }
    }
    updatePortfolio()
}

function sortStocks() {
    $('tr .fas').css('display', 'none')

  let type = app.sortType
  if (type === 'symbol_ascending') {
      sortSymbolAscending();
      $('#symbolHeader .fa-sort-up').css('display', 'inline')
    } else if (type === 'symbol_descending') {
      sortSymbolDescending();
      $('#symbolHeader .fa-sort-down').css('display', 'inline')
    } else if (type === 'shares_ascending') {
      sortSharesAscending();
      $('#sharesHeader .fa-sort-up').css('display', 'inline')
    } else if (type === 'shares_descending') {
      sortSharesDescening();
      $('#sharesHeader .fa-sort-down').css('display', 'inline')
    } else if (type === 'price_ascending') {
      sortPriceAscending();
      $('#priceHeader .fa-sort-up').css('display', 'inline')
    } else if (type === 'price_descending') {
      sortPriceDescening();
      $('#priceHeader .fa-sort-down').css('display', 'inline')
    } else if (type === 'value_ascending') {
      sortValueAscending();
      $('#totalHeader .fa-sort-up').css('display', 'inline')
    } else if (type === 'value_descending') {
      sortValueDescening();
      $('#totalHeader .fa-sort-down').css('display', 'inline')
    } else {
      console.log(type);
    }

    let appSave = JSON.stringify(app);
    localStorage.setItem('app', appSave);

    createTable()
}

function sortSymbolAscending() {
  app.portfolio.sort(function(a, b) {
    if (a.symbol < b.symbol) {
      return -1;
    } else if (a.symbol > b.symbol) {
      return 1;
    } else {
     return 0;
    }
  })
}

function sortSymbolDescending() {
  app.portfolio.sort(function(a, b) {
    if (a.symbol > b.symbol) {
      return -1;
    } else if (a.symbol < b.symbol) {
      return 1;
    } else {
     return 0;
    }
  })
}

function sortSharesAscending() {
  app.portfolio.sort(function (a, b) {
    return a.shares - b.shares;
  });
}

function sortSharesDescening() {
  app.portfolio.sort(function (a, b) {
    return b.shares - a.shares;
  });
}

function sortPriceAscending() {
  app.portfolio.sort(function (a, b) {
    return a.price - b.price;
  });
}

function sortPriceDescening() {
  app.portfolio.sort(function (a, b) {
    return b.price - a.price;
  });
}

function sortValueAscending() {
  app.portfolio.sort(function (a, b) {
    return (a.price * a.shares) - (b.price * b.shares);
  });
}

function sortValueDescening() {
  app.portfolio.sort(function (a, b) {
    return (b.price * b.shares) - (a.price * a.shares);
  });
}

function createTable() {
  app.total = 0
  for (let stock of app.portfolio) {
    app.total += stock.shares * stock.price
    addToTable(stock)

    let tv = app.total.toLocaleString(undefined, {maximumFractionDigits:2})
    $('#totalValue').html(`$${tv}`)
    $('#tableTotal').html(`$${tv}`)
    if (app.total > 1000000) {
      $('.value h3').css("fontSize", "2.5em")
    } else {
      $('.value h3').css("fontSize", "3em")
    }
  }
}

function updatePortfolio() {
  app.updated = 0
  app.portfolio.forEach((stock) => updateStockPrice(stock))
}

function updateStockPrice(stock) {
  $.get(`${base_url}/${stock.symbol}/quote?token=${token}`, function(data) { updatePrice(data, stock)})
}

function updatePrice(data, stock) {
  stock.price = data.latestPrice;
  app.updated += 1;
  if (app.updated === app.portfolio.length) {
    sortStocks()
  }
}
