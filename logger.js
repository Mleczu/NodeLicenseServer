const colors = require('colors')

colors.setTheme({
    date: ['brightBlue'],
    info: ['blue', 'italic'],
    warn: ['yellow', 'italic'],
    error: ['red', 'italic']
});

function formatDate(date) {
    return ('[' +
      [(date.getMonth() + 1).toString().padStart(2, '0'), (date.getDate()).toString().padStart(2, '0'), date.getFullYear()].join('/') + ' ' + 
      [(date.getHours()).toString().padStart(2, '0'), (date.getMinutes()).toString().padStart(2, '0'), (date.getSeconds()).toString().padStart(2, '0'),].join(':')
    + ']').date;
}

const info = function(message) {
    console.log(formatDate(new Date()) + ' [INFO] '.info + message.brightCyan)
}

const warn = function(message) {
    console.log(formatDate(new Date()) + ' [WARN] '.warn + message.brightYellow)
}

const error = function(message) {
    console.log(formatDate(new Date()) + ' [ERROR] '.error + message.toString().brightRed)
}

module.exports = { info, warn, error }