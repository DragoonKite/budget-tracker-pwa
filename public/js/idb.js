//db connection
let db;

//establish connection to IndexedDB called 'budget_tracker", version 1
const request = indexedDB.open('budget_tracker', 1)

//emit if the version changes
request.onupgradeneeded = function(event) {
    //save reference to db
    const db = event.target.result;
    //create object store
    db.createObjectStore('budget_tracker', {autoIncrement: true});
};

//on a success
request.onsuccess = function(event) {
    //when created with its objectStore
    db = event.target.result;

    //check internect connectivity
    if (navigator.onLine) {
        uploadBudget();
    }
};

//on an error
request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
};

//if there is no internet connectivity
function saveRecord(record) {
    // open a new transaction with the database with rw permissions 
    const transaction = db.transaction(['budget_tracker'], 'readwrite');
  
    // access the object store 
    const budgetObjectStore = transaction.objectStore('budget_tracker');
  
    // add record to  store 
    budgetObjectStore.add(record);
};

function uploadBudget() {
    // open a transaction on your db
    const transaction = db.transaction(['budget_tracker'], 'readwrite');
  
    // access your object store
    const budgetObjectStore = transaction.objectStore('budget_tracker');
  
    // get all records from store 
    const getAll = budgetObjectStore.getAll();
  
   // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function() {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
        fetch('/api/transaction/bulk', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(serverResponse => {
            if (serverResponse.message) {
                throw new Error(serverResponse);
            }
            // open one more transaction
            const transaction = db.transaction(['budget_tracker'], 'readwrite');
            // access the  object store
            const pizzaObjectStore = transaction.objectStore('budget_tracker');
            // clear all items in your store
            pizzaObjectStore.clear();

            alert('All saved budget additions has been submitted!');
            })
            .catch(err => {
            console.log(err);
            });
        }
    };
};

window.addEventListener('online', uploadBudget)