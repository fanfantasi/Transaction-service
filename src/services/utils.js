
const dayjs = require('dayjs');
const XLSX = require('xlsx');

function calculateAge(date) {
    var birthdateTimeStamp = new Date(date)
    var currentDate = new Date().getTime();
    var difference = currentDate - birthdateTimeStamp;
    var currentAge = Math.floor(difference / 31557600000)
    return currentAge
}

function randPass(lettersLength,numbersLength) {
    var j, x, i;
    var result        = '';
    var letters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var numbers       = '0123456789';
    for (i = 0; i < lettersLength; i++ ) {
        result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (i = 0; i < numbersLength; i++ ) {
        result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    result = result.split("");
    for (i = result.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = result[i];
        result[i] = result[j];
        result[j] = x;
    }
    result = result.join("");
    return result
}
function getDaysArray(year, month) {
    var numDaysInMonth, daysInWeek, daysIndex, index, i, l, daysArray;

    numDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    daysInWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    daysIndex = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
    index = daysIndex[(new Date(year, month - 1, 1)).toString().split(' ')[0]];
    daysArray = [];

    for (i = 0, l = numDaysInMonth[month - 1]; i < l; i++) {
        daysArray.push({
            'date': dayjs(new Date(`${year}-${month}-${i+1}`)).format('YYYY-MM-DD'),
            'day': daysInWeek[index++]
        })
        if (index == 7) index = 0;
    }

    return daysArray;
}
function getUniqueListBy(arr, key){
    return [...new Map(arr.map(item => [item[key], item])).values()]
}

function removeDuplicates(originalArray, prop) {
    var newArray = [];
    var lookupObject  = {};

    for(var i in originalArray) {
       lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for(i in lookupObject) {
        newArray.push(lookupObject[i]);
    }
     return newArray;
}
const phoneNumberFormatter = function(number) {
    let formatted = number.replace(/\D/g, '');

    if (formatted.startsWith('0')) {
        formatted = '62' + formatted.substr(1);
    }

    if (!formatted.endsWith('@c.us')) {
        formatted += '@c.us';
    }

    return formatted;
}

function groupweek(events) {
    return events.reduce((byWeek, event) => {
    let monthStart = new Date(event.date);
    monthStart.setDate(0);
    let offset = (monthStart.getDay() + 1) % 7 - 1;
    let weekNumber = Math.ceil((new Date(event.date).getDate() + offset) / 7)
    byWeek[weekNumber] = byWeek[weekNumber] || [];
    byWeek[weekNumber].push(event);
    return byWeek;
    }, {});
}
  
function countWeek(year, month) {
    var firstOfMonth = new Date(year, month, 1);
    var lastOfMonth = new Date(year, month+1, 0);
    var used = firstOfMonth.getDay() + lastOfMonth.getDate();
    return Math.ceil( used / 7);
}

function toTitleCase(phrase) {
    return phrase
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

function readXLSX(filePath) {
    // Read the workbook
    const workbook = XLSX.read(filePath, { type: 'buffer' });

    // Get the first sheet's name
    const sheetName = workbook.SheetNames[0];

    // Get the sheet
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const structuredData = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
    const headers = structuredData[0] // First row for headers
    const dataWithHeaders = structuredData.slice(1).map(row => {
    return row.reduce((acc, value, index) => {
        acc[headers[index]] = value; // Map header to corresponding value
        return acc;
    }, {});
    });

    return dataWithHeaders;
}

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radius bumi dalam meter
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Jarak dalam meter
    return distance;
  }

const convertToWIB = (utcDate) => {
    const date = new Date(utcDate);
    return date.toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour12: false,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};

async function calculateEuclideanDistance(descriptor1, descriptor2) {
    if (descriptor1.length !== descriptor2.length) {
    throw new Error('Descriptors must have the same length');
    }

    let distance = 0;
    for (let i = 0; i < descriptor1.length; i++) {
    distance += Math.pow(descriptor1[i] - descriptor2[i], 2);
    }

    return Math.sqrt(distance);
}

function euclideanDistance(vector1, vector2) {
    if (vector1.length !== vector2.length) {
        throw new Error("Vectors must have the same length");
    }

    let sumOfSquares = 0;
    for (let i = 0; i < vector1.length; i++) {
        sumOfSquares += Math.pow(vector1[i] - vector2[i], 2);
    }

    return Math.sqrt(sumOfSquares);
}


function euclideanDistances(vec1, vec2) {
    const dotProduct = vec1.reduce((sum, val, idx) => sum + val.x * vec2[idx].x + val.y * vec2[idx].y, 0);
    const magnitudeVec1 = Math.sqrt(vec1.reduce((sum, val) => sum + val.x * val.x + val.y * val.y, 0));
    const magnitudeVec2 = Math.sqrt(vec2.reduce((sum, val) => sum + val.x * val.x + val.y * val.y, 0));
    return dotProduct / (magnitudeVec1 * magnitudeVec2);

}

function normalizeKeypoints(vector) {
    const magnitude = Math.sqrt(vector.reduce((acc, val) => acc + val * val, 0));
    return vector.map(val => val / magnitude);
}
function calculateRatingSummary (ratingData) {
    const allRatings = ratingData.flatMap(item => item.detail.map(detail => detail.nilai));

    const totalRating = allRatings.reduce((sum, rating) => sum + rating, 0);

    const jumlahRating = allRatings.length;

    const rataRataRating = jumlahRating > 0 ? totalRating / jumlahRating : 0;

    return {
        totalRating: totalRating,
        jumlahRating: jumlahRating,
        rataRataRating: rataRataRating.toFixed(2)
    };
}
function calculateHours(startTime, endTime) {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
  
    const start = new Date(0, 0, 0, startHour, startMinute);
    const end = new Date(0, 0, 0, endHour, endMinute);
  
    let diff = (end - start) / (1000 * 60 * 60); // Convert ms to hours
    if (diff < 0) diff += 24; // Handle case jika endTime lebih kecil (lembur melewati tengah malam)
  
    return diff;
};
  
module.exports = { readXLSX, calculateRatingSummary, calculateHours, calculateAge, euclideanDistances, euclideanDistance, normalizeKeypoints, convertToWIB,  calculateEuclideanDistance, getDistanceFromLatLonInMeters, randPass, groupweek, countWeek, getDaysArray, getUniqueListBy, removeDuplicates, phoneNumberFormatter, toTitleCase };