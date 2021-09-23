'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-07-09T17:01:17.194Z',
    '2021-07-11T23:36:17.929Z',
    '2021-07-13T10:51:36.790Z',
  ],
  currency: 'INR',
  locale: 'en-IN', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'INR',
  locale: 'en-IN',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const dayspassed = calcDaysPassed(new Date(), date);
  // console.log(dayspassed);
  if (dayspassed === 0) return 'Today';
  if (dayspassed === 1) return 'Yesterday';
  if (dayspassed <= 7) return `${dayspassed} days ago `;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;
    return new Intl.DateTimeFormat(locale).format(date);
  }
};
const formattedCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formattedCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formattedCur(
    acc.balance,
    acc.locale,
    acc.currency
  );
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formattedCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formattedCur(
    Math.abs(out),
    acc.locale,
    acc.currency
  );

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formattedCur(
    interest,
    acc.locale,
    acc.currency
  );
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

//Fake always logged In
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

//Timer function
const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, '0');
    const sec = String(time % 60).padStart(2, '0');

    //In each call,print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    //When 0 sec,stop timer and logout user
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
    }

    //Decrease 1 sec
    time--;
  };
  //Set time to 5 minutes
  let time = 120;

  tick(); //calling the tick function immediately
  //call the timer every second
  const timer = setInterval(tick, 1000);
  return timer;
};

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  // console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    //create current date and time
    const now = new Date();
    const options = {
      //this is an object here
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric', //numeric,long
      year: 'numeric',
      // weekday: 'long', //short,narrow,long
    };
    // const locale = navigator.language; //getting locale from users browser
    // console.log(locale);

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    //Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    //reset Timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      //Add Loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      //reset Timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 3000);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/*
//168.Converting and Checking Numbers
//Numbers-In JavaScript all numbers are represented internally as floating point numbers. So basically always as decimals no matter if we actually write them as integers or decimals.We have only one data type for all Numbers.
//Numbers are represented internally in a 64 base 2 format and that means numbers are always stored in a binary format(0s and 1s)
//Base 10- 0 to 9
//Binary bas 2- O and 1
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);

//To convert string into a number we do this.
console.log(Number('23'));
console.log(+'23'); //When javascript sees the + operator it does type coercion. Basically it automatically converts all the operands to numbers.

//So we changed all the Number to + in this project so that our project looks a lil bit cleaner now.

//Parsing
console.log(Number.parseInt('98px', 10)); //The string needs to start with a number
//It tries to get rid of unnecessary symbols that are not numbers.
console.log(Number.parseInt('ex90', 10)); //This is not gonna work.

console.log(Number.parseFloat('2.5rem'));
console.log(Number.parseInt('2.5rem'));

//These two functions here are actually also so-called global functions.So its not necessary to call them on number.So this here also works.
// console.log(parseFloat('2.45rem'));

//We can use this to check if any value is a number
console.log(Number.isNaN(20));
console.log(Number.isNaN('20'));
console.log(Number.isNaN(+'20px'));

//Infinity is also not a NaN
console.log(Number.isNaN(23 / 0));

//Is finite is the best way to check if a value is a number.
console.log(Number.isFinite(23));
console.log(Number.isFinite(23 / 0));
console.log(Number.isFinite('23'));
console.log(Number.isFinite(+'20X')); //this here is not a number, this will ne NaN

console.log(Number.isInteger(23));
console.log(Number.isInteger(23.0));
console.log(Number.isInteger(23.5));
console.log(Number.isInteger(23 / 0));
*/

/*
//169) Math and Rounding
//Finding Square root in Javascript
console.log(Math.sqrt(25));
//The same can be achieved by using exponentiation
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3)); //The only way to calculate cube root

//Maximum Value
console.log(Math.max(100, 78, 56, 1003, 87, 67));
console.log(Math.max(100, 78, 56, '1003', 87, 67)); //It does type coercion as well

//Minimum Value
console.log(Math.min(89, 23, 56, 78, 9, 4));

//There are also constants on Math Object
//Calculating area of circle with radius 10px
console.log(Math.PI * Number.parseFloat('10px') ** 2);

//Creating Random Number between 1 and 6
console.log(Math.trunc(Math.random() * 6) + 1);

//Creating a function so that we can generate a number between min and max value
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
//By using math.random we will get number between 0...1
//so multiplying it by (max-min) will give us number between 0....(max-min)
//Adding Min on both sides will give us value between min....(max-min+min) which is basically min....max
console.log(randomInt(10, 20));

//Rounding Integers
console.log(Math.trunc(23.56));
console.log(Math.round(23.9));

// The Math.ceil() function always rounds a number up to the next largest integer.
console.log(Math.ceil(23.3));
console.log(Math.ceil(23.9));

//The Math.floor() function always rounds a number downward to its nearest integer.
console.log(Math.floor(23.3));
console.log(Math.floor(23.9));

//You might think that math.floor and math.trunc works the same. Yes it does but only for positive numbers not negative numbers.
console.log(Math.trunc(-23.3));
console.log(Math.floor(-23.3));

//Rounding Decimals
//toFixed method always returns a string
console.log((2.7).toFixed(0));
console.log((2.7).toFixed(3));
console.log((2.456).toFixed(2));
console.log(+(2.345).toFixed(2)); //+ is used here to convert string into number.
*/

/*
//170) The remainder Operator
console.log(5 % 2);
console.log(8 % 3);

const isEven = n => n % 2 === 0;
console.log(isEven(8));
console.log(isEven(23));
console.log(isEven(346));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach((row, i) => {
    if (i % 2 === 0) row.style.backgroundColor = 'cyan';
    if (i % 2 !== 0) row.style.backgroundColor = 'lightgreen';
  });
});
*/

/*
//171. Working with BigInt
//Introduced in ES2020
//Numbers are represented internally as 64 bits and that means that there are basically 64 zeroes and ones to represent any given number. Now of these 64 bits only 53 are used to actually store the digits themselves. The rest are for storing the position of the decimal point and the sign.
//So if there are only 53 bits to store the number that means that there is a limit of how big numbers can be and we can calculate that number.
console.log(2 ** 53 - 1); //We are doing - 1 here because the numbers starts at zero.

//This number is so important that it is basically saved into the number namespace
console.log(Number.MAX_SAFE_INTEGER);
//So any integer which is larger than this is not safe and that means it cannot be represented accurately.
console.log(2 ** 53 + 1); //these both shows the same output
console.log(2 ** 53 + 0);

//BigInt can be used to store numbers as large as we want.
console.log(466688837373770998473624243255353);
console.log(466688837373770998473624243255353n);
//We can create BigInt using bigInt function

console.log(BigInt(466688837373770998473624243255353));

//Operations
console.log(100000n + 100000000n);
console.log(456668788888899991223334444422n * 1000000n);
// console.log(Math.sqrt(16n)); //this will also not work

//We cannot do this
// const huge = 2028664737383997462553748n;
// const num = 23;
// console.log(huge * num);

const huge = 2028664737383997462553748n;
const num = 23;
console.log(huge * BigInt(num));

//Exceptions
//But this will work
//Comparison of a bigInt and a regular number
console.log(20n > 15);
console.log(20n === 20); //this will not work but this makes sense as in javascript as we use === operator it does not do type coercion. These two values here have a different primitive type.

console.log(typeof 20n);
console.log(20n == '20'); //here this will be true because JS will do type coercion.

//Bigint converting to string
console.log(huge + 'is really BIG!!');

//Divisions
console.log(11n / 3n);
console.log(10 / 3);
*/

//172. Creating Dates
//Create a date
//There are exactly four ways to create date. They all use the new date constructor function but they can accept different parameters.
/*
//1.using the new date constructor
const now = new Date();
console.log(now);

//2.Second way is to parse the date from date string
console.log(new Date('Jul 08 2021 00:24:40'));
//So simply giving javascript a string here and it will then automatically parse the time based on that.
console.log(new Date('february 11,1996')); //Javascript is pretty smart in parsing out the string that we write here.
console.log(new Date(account1.movementsDates[1]));
console.log(new Date(2037, 10, 19, 15, 23, 5));
//Here we have 10 as month but it is showing nov(which is 11th month) in output and so that means that the month in Javascript is zero based.
//JavaScript actually autocorrects the day
console.log(new Date(2037, 10, 31)); //but we know that november only has 30 days.
console.log(new Date(2037, 10, 33));

//We can also pass into date constructor function the amount of milliseconds passed since the beginning of the Unix time,which is January 1,1970.
console.log(new Date(0)); //0 milliseconds after that initial Unix time.

//So now lets create a date that is three days after this.
console.log(new Date(3 * 24 * 60 * 60 * 1000));

//Working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth()); //Remember this is zero based so 10th month will actually be 11th month which is november.
console.log(future.getDate());
console.log(future.getDay()); //output 4 means 4th day of the week which is thursday.
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString()); //this is similar to the movementDates in account1.
//We can also get the timestamp for the date.
console.log(future.getTime());

console.log(new Date(2142237180000));

//Method to get timestamp for right now
console.log(Date.now());

future.setFullYear(2040);
console.log(future);
*/

/*
//174.Operation with dates
//We can subtract one date from another date in order to calculate how many days have passed between the two dates.
const future = new Date(2037, 10, 19, 15, 23);
console.log(+future);

const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

const days1 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 4));
console.log(days1);
*/

//175. Internationalizing Dates (Intl)
//Javascript has a new internationalization API which allow us to easily format numbers and strings according to different languages.

/*
//Experimenting API
//Namespace for internationalization API- Intl
//For date and time we use DateTimeFormat
const now = new Date();
const options = {
  //this is an object here
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: 'long', //numeric,long
  year: 'numeric',
  weekday: 'long', //short,narrow,long
};
const locale = navigator.language; //getting the locale from user's browser
console.log(locale);

labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(
  now
);
*/
/*
//176. Internationalizing Numbers
//In the last lecture we formatted dates using internationalization API so we will not format regular numbers.
const num = 3888789.23;
const options = {
  style: 'currency', //Unit,percent,currency
  unit: 'celsius',
  currency: 'INR',
  // useGrouping: false,
};
console.log('US  :', new Intl.NumberFormat('en-US', options).format(num));
console.log('Germany :', new Intl.NumberFormat('de-DE', options).format(num));
console.log('Syria  :', new Intl.NumberFormat('ar-SY', options).format(num));
console.log('India  :', new Intl.NumberFormat('en-IN', options).format(num));
//Taking locale from the browser
console.log(
  navigator.language,
  new Intl.NumberFormat(navigator.language).format(num)
);
*/

/*
//177. Timers SetTimeout and SetInterval
//We have two kinds of timers
//1. The setTimeout timer runs just once after a defined time, while the setinterval timer keeps running forever, until we stop it.
//So basically we can use setTimeout to execute some code at some point in the future.
//So lets use this to simulate ordering a pizza.
//SetTimeout also receives a callback function just like array methods and DOM event handlers.
//We do not call this function ourselves, we simply pass in this function as an arguement to setTimeout and then setTimeout will call this function in the future.
// setTimeout(() => console.log('Here is Your Pizza🍕'), 5000); //5000 milliseconds means 5 seconds.
//Here we schedule this function call three seconds later.
// console.log('Waiting.....');

//Passing arguements into callback function of setTimeout
// setTimeout(
//   (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2} 🍕`),
//   3000,
//   'spinach',
//   'olives'
// );

//We can also cancel the timer
const ingredients = ['olives', 'spinach'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2} 🍕`),
  3000,
  ...ingredients
);
console.log('Waiting...');
if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

//What if we wanted to run a function over and over again, like every 5 seconds or every 10 minutes.

// setInterval
setInterval(function () {
  const now = new Date();
  const hour = now.getHours();
  const min = String(now.getMinutes()).padStart(2, '0');
  const sec = String(now.getSeconds()).padStart(2, '0');
  console.log(`${hour}:${min}:${sec}`);
}, 1000);
*/
