



// Budget Controller
var budgetController = (function() {
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};
	Expense.prototype.calcPercentage= function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);

		} else {
			this.percentage = -1;
		}
		
	};
	Expense.prototype.getPercentage = function() {
		return this.percentage;
	}

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value= value;
	};
	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(curr) {
			sum += curr.value;
		});
		data.totals[type] = sum;
	};

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget:0,
		percentage: -1
	}
	return {
		addItem: function(type, des, val) {
			var newItem, ID;
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1; // create new ID 
			} else {
				ID=0;
			}
			
			// create new item based on 'inc' or 'exp' type
			if(type === "exp") {
				newItem = new Expense(ID, des, val);

			} else if (type === "inc") {
				newItem = new Income(ID, des, val);
			}
			//push it into our data structure
			data.allItems[type].push(newItem);
			//return new element
			return newItem;
		},

		deleteItem: function(type, id) {
			var ids, index;

			ids = data.allItems[type].map(function(current) {   // map creates a new array, forEach loops over an array
				return current.id;
			});

			index = ids.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},

		calculateBudget: function() {
			//calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			//calculate budget: income - expenses
			data.budget = data.totals.inc - data.totals.exp;

			// calculate percentage of income spent
			if (data.totals.inc > 0) {
					data.percentage = Math.round((data.totals.exp /  data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}
			
		},

		calculatePercentages: function() {
			data.allItems.exp.forEach(function(cur) {
				cur.calcPercentage(data.totals.inc);
			});

		},

		getPercentages: function() {
			var allPerc = data.allItems.exp.map(function(cur) {
				return cur.getPercentage();
			});
			return allPerc;
		},

		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
		},

		testing: function() {
			console.log(data);
		}
	};

})();


// UI Controller
var UIController = (function() {
	var DOMString = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: ".budget__value",
		incomeLabel: ".budget__income--value",
		expensesLabel: ".budget__expenses--value",
		percentageLabel: ".budget__expenses--percentage",
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'

	};

	var formatNumber=  function(num, type) {
			var numSplit, int, dec, sign;
			num = Math.abs(num);
			// + or - before number

			// 2 decimal points
			num= num.toFixed(2);
			//comma seperating thousands
			numSplit = num.split('.');
			int = numSplit[0]; 
			if (int.length > 3) {
				int = int.substr(0, int.length - 3) + ',' + int.substr(int.length -3, 3);  // input 20000 result would be 20,000
			}
			dec = numSplit[1];
			
			return (type === 'exp' ? '-' : '+') + ' ' + int +  '.' + dec;
		}; 

		var nodeListForEach = function(list, callback) {
				for (var i=0; i < list.length; i++) {
					callback(list[i], i);
				}
		};

	return {
		getinput: function() {
			return {
				type: document.querySelector(DOMString.inputType).value,
				description: document.querySelector(DOMString.inputDescription).value,
				value: parseFloat(document.querySelector(DOMString.inputValue).value)
			};
		},

		addListItem: function(obj, type) {
			var html, newHTML, element;

			//create html string with plafeholder text
			if (type === 'inc') {
				element= DOMString.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			
			} else if (type === 'exp') {
				element= DOMString.expensesContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

			}
			// replace the placeholder text with data
			newHTML = html.replace('%id%', obj.id);
			newHTML = newHTML.replace('%description%', obj.description);
			newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

			// insert html into DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
		}, 
		deleteListItem: function(selectorID) {
			var el= document.getElementById(selectorID)
			el.parentNode.removeChild(el);
		},

		clearFields: function() {
			var fields, fieldsArr;
			fields = document.querySelectorAll(DOMString.inputDescription + ', ' + DOMString.inputValue);
			fieldsArr =Array.prototype.slice.call(fields);
			fieldsArr.forEach(function(current, index, array) {
				current.value = "";

			});
			fieldsArr[0].focus();
		},
		displayBudget: function(obj) {
			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';

			document.querySelector(DOMString.budgetLabel).textContent = formatNumber(obj.budget,type);
			document.querySelector(DOMString.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMString.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
			
			if (obj.percentage > 0) {
				document.querySelector(DOMString.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMString.percentageLabel).textContent = '---';
			}
		},

		displayPercentages: function(percentages) {
			var fields = document.querySelectorAll(DOMString.expensesPercLabel);   // returns a nodeList

			nodeListForEach(fields, function(current, index) {         // passes callback function
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}
				


			});
		},

		displayMonth: function() {
			var now, year, month, months;
			now = new Date();   // retrives current date
			// var christmas = new Date(2019, 11, 25);   would diplay specific date
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			month = now.getMonth();
			year = now.getFullYear();
			document.querySelector(DOMString.dateLabel).textContent = months[month] + ' ' + year;
		},

		changeType: function() {
			var fields = document.querySelectorAll(
				DOMString.inputType + ',' +
				DOMString.inputDescription + ',' +
				DOMString.inputValue);						//returns nodeList
			nodeListForEach(fields, function(cur) {
				cur.classList.toggle('red-focus');			// toggle adds class when its not there, and if it is it removes it
			});
			document.querySelector(DOMString.inputBtn).classList.toggle('red');
		},

		getDOMString: function () {
			return DOMString;
		}

		
	};

})();



//Global App Controller
var controller = (function(budgetCntrl, UICntrl) {
	var setupEventListeners = function() {
		var DOM = UIController.getDOMString();
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function(event) {
		if (event.keyCode === 13 || event.which === 13) {
			ctrlAddItem();
		}
	});
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener('change', UIController.changeType);
	};

	var updateBudget = function() {
		// calculate budget
		budgetController.calculateBudget();

		//return budget
		var budget = budgetController.getBudget();

		// display budget on UI
		UIController.displayBudget(budget);
	}

	var updatePercentages = function() {

		// calculate percentages
		budgetController.calculatePercentages();

		// read percent from budget controller
		var percentages = budgetController.getPercentages();

		// update UI with new percent
		UIController.displayPercentages(percentages);

	}
	
	var ctrlAddItem = function() {
		var input, newItem;
		//get the field input data
		input = UIController.getinput();
		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
			newItem = budgetController.addItem(input.type, input.description, input.value);
			//add item to UI
			UIController.addListItem(newItem, input.type);
			//clear fields
			UIController.clearFields();

			//calculate and update budget
			updateBudget();

			//calculate and update percentages
			updatePercentages();
	
		}
		
	

	};

	var ctrlDeleteItem = function(event) {
		var itemID, splitID, type, ID;
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if (itemID) {
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]); // parseInt converts string to integer, parseFloat converts string to decimal

			//delte item from data structure

			budgetController.deleteItem(type, ID);
			//delete item from UI
			UIController.deleteListItem(itemID);

			//update and show new budget
			updateBudget();

			//calculate and update percent
			updatePercentages();
		}
	}

	return {
		init: function() {
			UIController.displayMonth();

			UIController.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setupEventListeners();
		}
	};
	

})(budgetController, UIController);

controller.init();