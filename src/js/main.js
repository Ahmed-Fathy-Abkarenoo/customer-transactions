let customerData = {};

document.addEventListener("DOMContentLoaded", async () => {
  await getAllDataPage();
  homeInfo(customerData);
  sortingTable(customerData);
  lightDarkMode();
});

$(".name").keyup(() => {
  searchByName(customerData);
});

$(".amount").keyup(() => {
  searchByAmount(customerData);
});

async function getAllDataPage() {
  await getCustomerData();
  await getCustomerTransactions();
  displayData(customerData);
}

/**-----------------APIs-------------------------------- */
async function getCustomerData() {
  let httpRes = await fetch("http://localhost:3000/customers");
  let resp = await httpRes.json();
  customerData.customers = resp;
}
async function getCustomerTransactions() {
  let httpRes = await fetch("http://localhost:3000/transactions");
  let resp = await httpRes.json();
  customerData.transactions = resp;
}

/**-----------------Display Data------------------------ */
function displayDataSortingByName(data) {
  for (let i = 0; i < data.customers.length; i++) {
    let CustomerTransaction = data.transactions.filter(
      (transaction) => transaction.customer_id == data.customers[i].id
    );

    CustomerTransaction.forEach((transaction) => {
      $("#table-body").append(
        `<tr><td>${transaction.customer_id}</td><td>${data.customers[i].name}</td><td>${transaction.date}</td><td>${transaction.amount}</td></tr>`
      );
    });
  }
}

function displayData(data) {
  data.transactions.forEach((transaction) => {
    data.customers.find((customer) => {
      if (transaction.customer_id == customer.id) {
        $("#table-body").append(
          `<tr class="cursor-pointer"><td class="customer" -data-id="${customer.id}">${transaction.customer_id}</td><td class="customer" -data-id="${customer.id}">${customer.name}</td><td class="customer" -data-id="${customer.id}">${transaction.date}</td><td class="customer" -data-id="${customer.id}">${transaction.amount}</td></tr>`
        );
      }
    });
  });

  customerEvent();
}

/**------------------search-------------------------- */
function searchByName(data) {
  let searchTirm = $(".name").val();
  let searchData = {};

  $("#table-body").empty();

  for (let i = 0; i < data.customers.length; i++) {
    if (
      data.customers[i].name.toLowerCase().includes(searchTirm.toLowerCase())
    ) {
      let CustomerTransaction = data.transactions.filter(
        (transa) => transa.customer_id == data.customers[i].id
      );

      searchData.customers = data.customers;
      searchData.transactions = CustomerTransaction;

      displayData(searchData);
    }
  }
}

function searchByAmount(data) {
  let searchTirm = $(".amount").val();
  let searchData = {};

  $("#table-body").empty();

  data.transactions.forEach((transaction) => {
    if (transaction.amount.toString().includes(searchTirm)) {
      let CustomerTransaction = data.transactions.filter((transa) =>
        transa.amount.toString().includes(searchTirm)
      );

      searchData.customers = data.customers;
      searchData.transactions = CustomerTransaction;

      displayData(searchData);
    }
  });
}
/**-------------------------------------------------- */
function customerEvent() {
  let customer = $(".customer");

  customer.click((e) => {
    const customerId = $(e.target).attr("-data-id");

    let customerChatData = getUserChartData(customerId);

    $(".chart-section").removeClass("hidden");
    $(".table-section").addClass("hidden");

    $(".fa-close").click(() => {
      $(".chart-section").addClass("hidden");
      $(".table-section").removeClass("hidden");
      location.reload();
    });

    customerChart(customerChatData);
  });
}

function getUserChartData(index) {
  const custName = document.querySelector("#custName");
  const customerInfo = customerData.customers.find(
    (customer) => customer.id == index
  );

  custName.innerHTML = customerInfo.name;

  let CustomerTransaction = customerData.transactions
    .filter((transaction) => transaction.customer_id == index)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  let amounts = CustomerTransaction.map((trans) => trans.amount).reduce(
    (sum, num) => (sum += num)
  );
  // console.log(amounts);
  $("#CustTotal").text(amounts);

  return CustomerTransaction;
}

function customerChart(data) {
  const ctx = document.getElementById("myChart");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: data.map((row) => row.date),
      datasets: [
        {
          label: "Customer Totale Transactions",
          data: data.map((row) => row.amount),
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      maintainAspectRatio: false,
    },
  });
}

function sortingTable(data) {
  let sortBy = document.querySelector("#sortBy");
  let sort = {};

  sortBy.addEventListener("change", (e) => {
    if ($(e.target).val() === "byName") {
      sort.transactions = data.transactions;
      sort.customers = data.customers.sort((a, b) => {
        let x = a.name.toUpperCase(),
          y = b.name.toUpperCase();
        return x == y ? 0 : x > y ? 1 : -1;
      });
      // console.log(sort.customers);
      $("#table-body").empty();
      displayDataSortingByName(sort);
    } else if ($(e.target).val() === "byAmount") {
      sort.transactions = data.transactions.sort((a, b) => a.amount - b.amount);
      sort.customers = data.customers;
      // console.log(sort.transactions);
      $("#table-body").empty();
      displayData(sort);
    }
  });
}

function homeChart(total, custom) {
  const ctx = document.getElementById("homeChart");

  new Chart(ctx, {
    type: "polarArea",
    data: {
      labels: custom,
      datasets: [
        {
          label: "Total Transactions",
          data: total,
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      maintainAspectRatio: false,
    },
  });
}

function homeInfo(data) {
  const noOfCust = document.querySelector("#noOfCust");
  const maxTrans = document.querySelector("#maxTrans");

  let totalTrans = [];
  let customersName;

  noOfCust.innerHTML = data.customers.length;

  const amounts = data.transactions
    .map((transaction) => transaction.amount)
    .sort((a, b) => a - b);

  let maxTransacion = amounts[amounts.length - 1];

  maxTrans.innerHTML = maxTransacion;

  for (let i = 0; i < data.customers.length; i++) {
    let CustomerTransaction = data.transactions.filter(
      (transaction) => transaction.customer_id == data.customers[i].id
    );

    let amounts = CustomerTransaction.map((trans) => trans.amount).reduce(
      (sum, num) => (sum += num)
    );

    totalTrans.push(amounts);
  }

  customersName = data.customers.map((customer) => customer.name);

  homeChart(totalTrans, customersName);
}
/**--------------------------Dark Mode------------------------ */
function lightDarkMode() {
  let btn = document.querySelector("#toggle");

  btn.addEventListener("change", () => {
    if (btn.checked) {
      $("html").addClass("dark");
      $(".fa-sun").addClass("hidden");
      $(".fa-moon").removeClass("hidden");
    } else {
      $("html").removeClass("dark");
      $(".fa-sun").removeClass("hidden");
      $(".fa-moon").addClass("hidden");
    }
  });

  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    $("html").addClass("dark");
    $(".fa-sun").addClass("hidden");
    $(".fa-moon").removeClass("hidden");
    btn.checked = true;
  }
}
