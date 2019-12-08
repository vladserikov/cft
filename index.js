import './src/scss/main.scss';

const url = 'http://localhost:3001/files';
const main = document.querySelector('main'); // main tag
const form = document.getElementById('form'); // form filter
const load = document.getElementById('load'); // form load
const file = document.getElementById('file'); // input load
const inputDate = Array.from(document.querySelectorAll('.input_date'));
let arrData = []; // for data 

inputDate.map(input => {
    input.addEventListener('focus', e => {
        input.setAttribute('type', 'date')
    })
    input.addEventListener('focusout', e => {
        input.setAttribute('type', 'text')
    })
})

// first load
loadServerData(); 
// function request data
function loadServerData() {
    fetch(url)
        .then(response => response.json())
        .then(json => {
            arrData = [...json];
            renderData(arrData)
        })
}

function filterData(firstDay, lastDay, type) {
    let copyData = [...arrData];

    if (firstDay) {
        copyData = copyData.filter(obj => new Date(firstDay) <= new Date(obj.load))
    }
    if(lastDay){
        copyData = copyData.filter(obj => new Date(lastDay) >= new Date(obj.load))
    }
    if (type) {
        copyData = copyData.filter(obj => obj.type === type)
    }
    renderData(copyData)
}

function deletFile(id) {
    fetch(url +'/' + id, {
        method: 'delete',
        body: JSON.stringify(id)
    }).then(res => res.json())
      .then(resJson => console.log(resJson))
    loadServerData()
}

// function for render use tag template
function renderData(arr) {
    main.innerHTML = '';
    const tmp = document.querySelector('#tmp'),
        container = tmp.content.querySelector('.container'),
        typeFile = container.querySelector('.type'),
        dateLoad = container.querySelector('.date_load'),
        fileName = container.querySelector('.file_name'),
        size = container.querySelector('.sizefile'),
        userName = container.querySelector('.user_name'),
        dateContainer = container.querySelector('.date_container');

    // loop fill render content 
    for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
        // element content fill   
        typeFile.textContent = element.type;
        fileName.textContent = element.filename;
        // console.log();
        
        size.textContent = returnSize(element.filesize);
        userName.textContent = element.name;

        const timeStore = new Date(element.load)
        dateLoad.textContent = `${timeStore.toLocaleDateString('ru')}`;

        timeStore.setFullYear(timeStore.getFullYear() + 1)
        dateContainer.textContent = `${timeStore.toLocaleDateString('ru')}`;        

        const clone = document.importNode(tmp.content, true)
        const deleteBtn = clone.querySelector('.delete');
        const contDel = clone.querySelector('.container');

        // delete element on node and data
        deleteBtn.addEventListener('click', e => {
            deletFile(element.id);
            contDel.remove();
        })

        main.appendChild(clone)
    }
}

function returnSize(size){
    size = Number(size);
    const step = 1024;
    let count = 0;
    console.log(size, step);
    while (size / step > 1 || count > 3) {
        size = size / step;
        count++
    }
    size = size.toFixed(2);
    if (count === 0) {
        return `${size} bt`
    } else if (count === 1){
        return `${size} kb`
    } else if (count === 2){
        return `${size} mb`
    } else if (count === 3){
        return `${size} gb`
    } else {
        return `${size} tb`
    }
    
}

// listener send filter
form.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log(e);
    const first = form.querySelector('#first').value,
        two = form.querySelector('#two').value,
        list = form.querySelector('#list').value;
    console.log(first, two, list);
    main.innerHTML = ''    
    filterData(first, two, list)
})

// input file listener
file.addEventListener('change', e => {
    const fileLoad = file.files[0];
    const name = fileLoad.name
    const strReg = /(?<=\.)\w+$/i;
    const startStr = /^.+(?=\.)/i
    console.log(name.match(strReg))
    console.log(name.match(startStr))
})

// function post data on server
function postFile() {
    const fileLoad = file.files[0]; // file in input
    const typeStr = /(?<=\.)\w+$/i; // regex for search type
    const startStr = /^.+(?=\.)/i; // regex for search name
    const filename = fileLoad.name.match(startStr)[0]; // name file
    const type = fileLoad.name.match(typeStr)[0].toUpperCase(); // type file

    // data for send server
    const data = {
        name: 'Garik Harlamov',
        filename,
        filesize: fileLoad.size,
        type,
        load: new Date()
    }
    
    // send
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(data => {
            loadServerData()
        })
}

// listener submit data
load.addEventListener('submit', e => {
    e.preventDefault();
    postFile()
})

