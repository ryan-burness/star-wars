/**
 * Storage Manager  
 * uses session's local storage or a 
 */
class LocalStorageManager {
    constructor(prefix) {
        this.prefix = prefix;
        this.storage = null;
        try {
            //check we can use local storage
            localStorage.setItem(this.prefix, 'test');
            if (localStorage.getItem(this.prefix) === 'test') {
                localStorage.removeItem(this.prefix);
                this.storage = localStorage;
            } else {
                this.storage = {};
            }
        } catch (e) {
            this.storage = {};
        }
    }

    setItem(key, value) {
        const timestamp = Date.now();
        this.storage[this.prefix + '-' + key] = JSON.stringify({ timestamp, value });
    }

    getItem(key) {
        const item = this.storage[this.prefix + '-' + key];
        if (item) {
            const parsedItem = JSON.parse(item);
            if (Date.now() - parsedItem.timestamp <= 7 * 24 * 60 * 60 * 1000) {
                return parsedItem.value;
            } else {
                this.removeItem(key);
                return null;
            }
        } else {
            return null;
        }
    }

    removeItem(key) {
        delete this.storage[this.prefix + '-' + key];
    }
}
/**
 * Character Manager Class
 * uses local storage to persist selections
 */
class CharacterManager {
    
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        //generate a key to make storage unique
        this.key = 'characterM-';
        this.storageManager = new LocalStorageManager(this.key);
        this.collectionKey = 'selections';
        this.templateElement = null;
        this.dailyCostTargetTotal = 0;
        this.dailyCostTargetKey = 'dailyCostTarget';

        try {
            //clone, set and remove master card
            const templateElement = document.querySelector('#characterMasterCard');
            this.templateElement = templateElement.cloneNode(true);
            templateElement.remove();
        } catch (e) {
            console.error('Couldnt set template element');
        }
    }
    /**
     * Fetch api with 20 second timeout
     */
    async getCharactersFromApi() {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 20000);

        try {
            const response = await fetch(this.apiUrl, { signal: controller.signal });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // If data is empty, throw an error
            if (!data || !data.results || data.results.length === 0) {
                throw new Error('No data received');
            }

            return data.results;

        } catch (error) {
            throw error;
        } finally {
            clearTimeout(id);
        }
    }

    /**
     * Create character element from master template
     */
    createCharacterDomElement(characterData) {

        if (!this.templateElement) {
            return;
        }

        // Clone the template element
        const characterDiv = this.templateElement.cloneNode(true);
        const planetDiv = characterDiv.querySelector('#planet-section');

        characterDiv.classList.remove('d-none');
        characterDiv.removeAttribute('id');
        planetDiv.removeAttribute('id');

        // Replace various content
        if (characterData.image != null && characterData.image.trim().length > 0) {
            characterDiv.querySelector('.character-img img').src = characterData.image;
        }
        characterDiv.querySelector('.character-title').textContent = characterData.name;

        //species
        if (characterData.families != null && characterData.families.length > 0) {
            let speciesTag = '';
            characterData.families.forEach((family) => {
                speciesTag = speciesTag + family.name + ', ';
            });
            characterDiv.querySelector('.character-subtitle').textContent = speciesTag.replace(/(^[,\s]+)|([,\s]+$)/g, '');
        }


        if (characterData.homeworld != undefined) {
            planetDiv.querySelector('.planet-img img').src = characterData.homeworld.image;
            planetDiv.querySelector('.planet-name').textContent = characterData.homeworld.name;
            planetDiv.querySelector('.planet-cost').textContent = characterData.homeworld.fees_per_day;

            const homeplanetBtn = planetDiv.querySelector('.planet-btn-sel');
            homeplanetBtn.setAttribute('data-swc-option', characterData.external_reference);
            homeplanetBtn.setAttribute('data-swc-cost', characterData.homeworld.fees_per_day);
        } else {
            planetDiv.remove(); 
        }

        return characterDiv;
   
    }

    calculateTotalCost() {
        const selections = this.getSelections();

        if (!selections) {
            return;
        }

        //get and update total select fees
        const totalCost = selections.reduce((accumulator, selection) => accumulator + parseFloat(selection.cost), 0);
        document.querySelector('#daily-fee-total').innerText = totalCost.toLocaleString('en-US');

        //check if they have met the total
        if (totalCost == this.getDailyCostTargetTotal()) {
            document.querySelector('#action-content-success').classList.remove('d-none');
        } else {
            document.querySelector('#action-content-success').classList.add('d-none');
        }
    }

    getSelections() {
        return this.storageManager.getItem(this.collectionKey) || [];
    }

    setSelections(currentSelections) {
        this.storageManager.setItem(this.collectionKey, currentSelections);
    }

    getDailyCostTargetTotal() {
        return this.storageManager.getItem(this.dailyCostTargetKey) || 0;
    }

    setDailyCostTargetTotal(currentSelections) {
        this.storageManager.setItem(this.dailyCostTargetKey, currentSelections);
    }

    removeSelections() {
        this.storageManager.removeItem(this.collectionKey);
    }

    handleButtonClick(event) {

        const clickedButton = event.target;

        //must be a button 
        if (clickedButton.tagName !== 'BUTTON') {
            return;
        }

        const option = clickedButton.getAttribute('data-swc-option');
        const cost = clickedButton.getAttribute('data-swc-cost');
        const unselect = clickedButton.classList.contains('active');

        //must have both options
        if (!option || !cost) {
            return;
        }

        const currentSelections = this.getSelections();
        if (unselect) {
            //apply selected state
            this.unselectCharacterEl(clickedButton);
            // Remove pair and update
            this.setSelections(currentSelections.filter(pair => pair.option !== option));

        } else {
            //apply selected state
            this.selectCharacterEl(clickedButton);

            //add pair to session
            const selectedPair = { option, cost };
            //merge to ensure we have unqiue pairs based on group
            this.setSelections(this.mergeAndReplace(currentSelections, selectedPair));
        }

        //update
        this.calculateTotalCost();
    }

    unselectCharacterEl(buttonEl) {
        buttonEl.classList.remove('active');
        buttonEl.textContent = "Select";
        const parent = buttonEl.closest('.character-card');
        const cardStatus = parent.querySelector('.card-status');
        cardStatus.classList.add('d-none')
        
    }
    selectCharacterEl(buttonEl) {
        buttonEl.classList.add('active');
        buttonEl.textContent = "Remove";
        const parent = buttonEl.closest('.character-card');
        const cardStatus = parent.querySelector('.card-status');
        cardStatus.classList.remove('d-none')
    }
    /**
     * Merge two objects replacing duplicates
     */ 
    mergeAndReplace(arr1, arr2) {
        const map = new Map();
        arr1.concat(arr2).forEach(item => map.set(item.option, item));
        return Array.from(map.values());
    }

    populateCharactersList(charactersData) {

        if (!this.templateElement || !Array.isArray(charactersData) || charactersData.length === 0) {
            this.showNoResultsTab();
            return;
        }

        //loading
        this.showLoadingTab();

        const charactersListDiv = document.querySelector('#characters-list');

        if (charactersListDiv.children.length > 0) {
            //reset listing
            charactersListDiv.innerHTML = '';
        }

        //build our characters list
        const charactersElements = charactersData.map(this.createCharacterDomElement.bind(this));
        //add to dom
        charactersElements.forEach((characterElement) => {
            charactersListDiv.appendChild(characterElement);
        });

        //action handeler
        charactersListDiv.addEventListener('click', this.handleButtonClick.bind(this));
        //show characters
        this.showCharactersTab();

        //generate a target
        if (this.getDailyCostTargetTotal() == 0) {
            this.createTargetTotal();
        } else {
            this.setTargetTotal(this.getDailyCostTargetTotal());
        }

        //apply existing selections
        const selections = this.getSelections();

        if (selections != undefined && selections.length > 0) {
            let found = [];
            selections.forEach((selection) => {
                const button = document.querySelector(`button[data-swc-option="${selection.option}"]`);
                if (button) {
                    button.click();
                    found.push(selection);
                } 
            });
            this.setSelections(found);
        }

    }

    async loadCharactersList() {

        clearInterval(this.retryTimer);

        this.getCharactersFromApi().then(charactersData => {
            this.populateCharactersList(charactersData)
        }).catch(error => {
            this.showNoResultsTab();
            console.error(error);
            //re-attempt after 1 minute
            this.retryTimer = setInterval(async () => {
                try {
                    this.loadCharactersList();
                } catch (error) {
                    console.error(error);
                }
            }, 60000);
        })
    }

    showNoResultsTab() {
        this.toggleTabs('tabNoContent');
    }

    showLoadingTab() {
        this.toggleTabs('tabLoading');
    }

    showCharactersTab() {
        this.toggleTabs('tabCharacters');
    }

    toggleTabs(tabRef) {
        //clear existing states
        const buttonsInSameGroup = document.querySelectorAll('.tabitem');
        buttonsInSameGroup.forEach((button) => {
            button.classList.remove('active');
        });
        //show selected content
        document.querySelector(`#${tabRef}`).classList.add('active');
    }

    resetSelections(event) {

        //clear selections
        this.removeSelections();

        //remove selected buttons
        const selected = document.querySelectorAll('#characters-list .planet-btn-sel.active');
        selected.forEach((button) => {
            this.unselectCharacterEl(button);
        });

        //update
        this.calculateTotalCost();

        //create a new total
        this.createTargetTotal();
    }

    createTargetTotal() {
        //select all planet cost elements
        const options = document.querySelectorAll('.planet-cost');
        const numOptions = options.length;

        if (numOptions == 0) {
            return;
        }

        //randomly select range
        const start = this.getRandomInt(1, Math.round(numOptions*.7));
        const end = this.getRandomInt(start, numOptions);
        let total = 0;

        for (let i = start; i <= end; i++) {
            if (options[i]) {
                total += parseFloat(options[i].innerText);
            }
        }

        this.setTargetTotal(total);
        
    }

    setTargetTotal(total) {
        document.querySelector('#target-total').innerText = total.toLocaleString('en-US');
        this.setDailyCostTargetTotal(total);
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    init() {
        window.onload = () => {
            this.loadCharactersList();
        };

        const resetBtn = document.querySelector('#action-reset-selection');
        if (resetBtn) {
            resetBtn.addEventListener('click', this.resetSelections.bind(this));
        }

    }
}

//Initalise the Character Manager
const characterManager = new CharacterManager('/api/characters');
characterManager.init();


