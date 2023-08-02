let data = [8,4,2,1,3,7,5];
let recentData = JSON.parse(JSON.stringify(data));
let algoChosen = 'bubble';
let isStarted = false;
let animateController = new AbortController();


window.onload = function () {
    init();
}

let init= function(){
    d3.select("#bubble").classed("selected", true); // init algo choice to bubble
    addSliderListener();
    addArrayModalListener();
    addAlgoListsListener();
    addRadioBtnListener();
    addStartBtnListener();
    addResetBtnListener();
    renderRects(data);
}

let addStartBtnListener = function () {
    let startBtn = d3.select('#sortStart');
    startBtn.on('click', () => {
        if (!isStarted) {
            isStarted = true;
            recentData = JSON.parse(JSON.stringify(data));
            animate();
        }
    });

}

let addResetBtnListener = function () {
    let resetBtn = d3.select('#reset');
    resetBtn.on('click', () => {
        reset();
    });
}

let addRadioBtnListener = function () {
    let radioBtn = d3.selectAll('input[name="option"]');
    radioBtn.on('click', function() {

        if (animateController) {
            animateController.abort();
            animateController = new AbortController(); 
        }

         // get radio button element that is checked
         let selectedRadio = d3.select(this);
        let selectedRadioId = selectedRadio.attr('id'); // id is random, duplicate or decending
        data = generateArrayInput(selectedRadioId);
        // put the data into array input
        d3.select('#arrayInput').property('value', data);
        renderRects(data);
        isStarted = false;
        }); 
};


let generateArrayInput = function (selectedRadioId) {
    if(selectedRadioId === 'duplicate') {
        return generateRandomIntegersWithDuplicates(10,4);
    }else if(selectedRadioId === 'random') {
        return generateRandomIntegers(10);
    }else if(selectedRadioId === 'descending') {
        return generateDescendingIntegers(10);
    }
}

let generateRandomIntegers= function(count) {
    let integers = [];
    for (let i = 0; i < count; i++) {
      integers.push(Math.floor(Math.random() * 10) + 1);
    }
    return integers;
  }

let generateRandomIntegersWithDuplicates = function(count, numDuplicates) {
    if (numDuplicates > count) {
      throw new Error('Number of duplicates cannot be greater than the count.');
    }
  
    let integers = [];
    for (let i = 0; i < count - numDuplicates; i++) {
      integers.push(Math.floor(Math.random() * 10) + 1);
    }
  
    // Adding duplicates
    for (let i = 0; i < numDuplicates; i++) {
      const randomIndex = Math.floor(Math.random() * integers.length);
      integers.push(integers[randomIndex]);
    }
  
    return integers;
  }

let generateDescendingIntegers= function(count) {
    let integers = [];
    for (let i = 0; i < count; i++) {
      integers.push(Math.floor(Math.random() * 10) + 1);
    }
  
    integers.sort((a, b) => b - a);
    return integers;
  }
  

let addSliderListener = function () {
    let input = document.getElementById('speed-slider');
    let speedVal = document.getElementById('speed-value');
    input.addEventListener('input', () => speedVal.innerText = (input.value / input.min).toFixed(1) + 'x');
}

let addArrayModalListener = function () {
    // Get the modal
    let modal = document.getElementById("myModal");
    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];
    // When the user clicks the button, open the modal 
    let arrayInput = document.getElementById("arrayInput");
    arrayInput.addEventListener('click', () => modal.style.display = "block");
    // When the user clicks on <span> (x), close the modal
    span.addEventListener('click', () => modal.style.display = "none");
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    let arraySubmitBtn = d3.select('#arrayBtn');
    arraySubmitBtn.on('click', () => {
        if (animateController) {
            animateController.abort();
            animateController = new AbortController(); 
        }

        let textAreaValue = d3.select('#modalInput').property('value');
        if (!textAreaValue) {
            alert("Please input your array!");
        } else {
            //console.log(typeof textAreaValue);
            let arr = textAreaValue.split(',').map(Number);
            console.log(arr);
            //check if array is valid
            let isValid = arr.every(Number.isInteger);
            if (!isValid) {
                alert("Please input integers separated by commas!");
            } else {
                // set input array
                data = arr;
                d3.select('#arrayInput').property('value', data);
                // reset radio button to null
                d3.selectAll('input[name="option"]').property('checked', false);
                // close modal
                let modal = d3.select('#myModal');
                modal.style('display', 'none');

                // console.log('in modal', data);

                renderRects(data);
                isStarted = false;
            }
        }
    })
}

let addAlgoListsListener = function () {
    d3.select("#algo-list")
        .selectAll("li")
        .on("click", function () {
            d3.selectAll("#algo-list li").classed("selected", false);
            d3.select(this).classed("selected", true);
            let selectedAlgo = d3.select(this).attr('id');
            algoChosen = selectedAlgo;
            // console.log("Selected Algorithm: " + selectedAlgo);
        });
}

let renderRects = function (data) {
    let canvas = d3.select("svg").selectAll("*")
    if (canvas.size() > 0)canvas.remove();

    let svgWidth = parseInt(d3.select('svg').style('width'));
    let xScale = d3.scaleBand()  // ordinal scale
        .domain(d3.range(data.length))  // set domain
        .range([svgWidth / 8, svgWidth * 7 / 8])  // set range, middle of the svg
        .paddingInner(0.1);  // add some paddings around the rects

    d3.select('svg')
        .selectAll('g') // as a group: rectangles with integers
        .data(data)
        .join(
            enter => {
                let groups = enter.append('g').attr('id', (d, i) => 'g' + i)
                let rects = groups.append('rect')
                    .attr('x', (d, i) => xScale(i))
                    .attr('width', xScale.bandwidth())
                    .attr('height', d => d * 50)
                    .attr('y', 20)
                    .style('fill', 'blue');
                let labels = groups.append('text')
                    .attr('x', (d, i) => xScale(i)+xScale.bandwidth()/2)
                    .attr('y', d => d * 50 + 40)
                    .text(d => d);
            }
            );
}

let animate = async function () {
    const signal = animateController.signal; 
    try {
        if (algoChosen === 'bubble') {
            await bubbleSort(data, signal);
        }
        else if (algoChosen === 'selection') {
            await selectionSort(data, signal);
        }
        else if (algoChosen === 'insertion') {
            await insertionSort(data, signal);
        }
    } catch (err) {
        if (err.message === 'Animation was aborted') {
            console.log('Animation aborted');
        } else {
            throw err;
        }
    }
}

async function bubbleSort(data, signal) {
    let len = data.length;
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len - i - 1; j++) {
            if (signal.aborted) {
                throw new Error('Animation was aborted');
            }

            // Select current and next group
            let gCurrent = d3.select('#g' + j);
            let gNext = d3.select('#g' + (j + 1));

            // Check if the rectangles are in the wrong order
            if (data[j] > data[j + 1]) {
                // Swap data elements
                [data[j], data[j + 1]] = [data[j + 1], data[j]];

                // Swap the groups
                let transRectCurr = gCurrent
                    .select('rect').style('fill', 'gold')
                    .transition().duration(getAnimationSpeed())
                    .attr('x', gNext.select('rect').attr('x'))
                    .style('fill', 'blue');
                
                let transTextCurr = gCurrent
                    .select('text')
                    .transition().duration(getAnimationSpeed())
                    .attr('x', gNext.select('text').attr('x'));

                let transRectNext = gNext
                    .select('rect').style('fill', 'gold')
                    .transition().duration(getAnimationSpeed())
                    .attr('x', gCurrent.select('rect').attr('x'))
                    .style('fill', 'blue');
                
                let transTextNext = gNext
                    .select('text')
                    .transition().duration(getAnimationSpeed())
                    .attr('x', gCurrent.select('text').attr('x'));
                    
                // Wait for the transitions to end
                await transRectCurr.end();
                //await transitionNext.end();

                // Swap group ids
                gCurrent.attr('id', 'g' + (j + 1));
                gNext.attr('id', 'g' + j);
            }
        }

        if (signal.aborted) {
            throw new Error('Animation was aborted');
        }

        // set thr sorted rect to green
        let rectSorted = d3.select('#g' + (len - i - 1))
            .select('rect')
            .transition().duration(getAnimationSpeed())
            .style('fill', 'green');

        await rectSorted.end();
    }
}


async function selectionSort(data,signal) {
   
    let len = data.length;
    for (let i = 0; i < len; i++) {
        let minIndex = i; // Start with current index as minimum

        // Find minimum in the rest of array
        for (let j = i + 1; j < len; j++) {
            if (data[j] < data[minIndex]) {
                minIndex = j;
            }
        }

        // If the minimum isn't the current index, swap
        if (minIndex !== i) {

            if (signal.aborted) {
                throw new Error('Animation was aborted');
            }

            [data[i], data[minIndex]] = [data[minIndex], data[i]];

            let rectCurrent = d3.select('#g' + i);
            let rectMin = d3.select('#g' + minIndex);

            // Swap the groups
            let transRectCurr = rectCurrent
                .select('rect')
                .style('fill', 'gold')
                .transition().duration(getAnimationSpeed())
                .attr('x', rectMin.select('rect').attr('x'))
                .style('fill', 'blue');

            let transTextCurr = rectCurrent
                .select('text')
                .transition().duration(getAnimationSpeed())
                .attr('x', rectMin.select('text').attr('x'));

            let transRectMin = rectMin
                .select('rect')
                .style('fill', 'gold')
                .transition().duration(getAnimationSpeed())
                .attr('x', rectCurrent.select('rect').attr('x'))
                .style('fill', 'blue');
            
            let transTextMin = rectMin
                .select('text')
                .transition().duration(getAnimationSpeed())
                .attr('x', rectCurrent.select('text').attr('x'));

            // Wait for the transitions to end
            await transRectCurr.end();

            // Swap rectangle ids
            rectCurrent.attr('id', 'g' + minIndex);
            rectMin.attr('id', 'g' + i);
        }

        if (signal.aborted) {
            throw new Error('Animation was aborted');
        }

        // Set the sorted rect to green
        let rectSorted = d3.select('#g' + i)
            .select('rect')
            .transition().duration(getAnimationSpeed())
            .style('fill', 'green');
        await rectSorted.end();
    }
}

async function insertionSort(data, signal) {
    let len = data.length;
    for (let i = 1; i < len; i++) {
        let key = data[i];
        let j = i - 1;

        /* Move elements of data[0..i-1], that are
           greater than key, to one position ahead
           of their current position */
        while (j >= 0 && data[j] > key) {

            if (signal.aborted) {
                throw new Error('Animation was aborted');
            }
            let rectCurrent = d3.select('#g' + (j + 1));
            let rectPrev = d3.select('#g' + j);

            // Swap the groups
            let transRectCurr = rectCurrent
                .select('rect')
                .style('fill', 'gold')
                .transition().duration(getAnimationSpeed())
                .attr('x', rectPrev.select('rect').attr('x'))
                .style('fill', 'blue');

            let transTextCurr = rectCurrent
                .select('text')
                .transition().duration(getAnimationSpeed())
                .attr('x', rectPrev.select('text').attr('x'));
            
            let transRectPrev = rectPrev
                .select('rect')
                .style('fill', 'gold')
                .transition().duration(getAnimationSpeed())
                .attr('x', rectCurrent.select('rect').attr('x'))
                .style('fill', 'blue');

            let transTextPrev = rectPrev
                .select('text')
                .transition().duration(getAnimationSpeed())
                .attr('x', rectCurrent.select('text').attr('x'));


            // Wait for the transitions to end
            await transRectCurr.end();

            // Swap rectangle ids
            rectCurrent.attr('id', 'g' + j);
            rectPrev.attr('id', 'g' + (j + 1));

            data[j + 1] = data[j];
            j = j - 1;
        }
        data[j + 1] = key;

        if (signal.aborted) {
            throw new Error('Animation was aborted');
        }

        // Set the sorted rect to green and then back to blue
        let transitionSorted = d3.selectAll('#g' + Array.from({length: i + 1}, (_, k) => k).join(',#g'))
        .selectAll('rect')
        .transition().duration(getAnimationSpeed())
        .style('fill', 'green')
        .transition().duration(getAnimationSpeed()+500)
        .style('fill', 'blue');
        await transitionSorted.end();
    }

    // After the whole array is sorted, set all elements to green
    for (let i = 0; i < len; i++) {

        if (signal.aborted) {
            throw new Error('Animation was aborted');
        }

        let rectFinal = d3.select('#g' + i)
            .select('rect')
            .transition().duration(getAnimationSpeed()/3)
            .style('fill', 'green');
        await rectFinal.end();
    }
}


let getAnimationSpeed = function () {
    time = document.getElementById('speed-slider').value;
    maxTime = document.getElementById('speed-slider').max;
    minTime = document.getElementById('speed-slider').min;
    speed = (maxTime / time) * minTime;
    return speed;
}

let reset = function () {
    
    if (animateController) {
        animateController.abort();
        animateController = new AbortController(); 
    }

    // set data to user recent input
    data = JSON.parse(JSON.stringify(recentData));
    renderRects(data);
    // clear the radio buttons
    d3.selectAll('input[name="option"]').property('checked', false);
    // reset the array input to recent input
    d3.select('#arrayInput').property('value', data);
    // reset the algo list to bubble
    d3.select('#algo-list').selectAll('li').classed('selected', false);
    d3.select("#bubble").classed("selected", true); // init algo choice to bubble
    algoChosen = 'bubble';
    // reset the slider to min value
    let minVal = d3.select("#speed-slider").property("min");
    d3.select("#speed-slider").property("value", minVal);
    d3.select("#speed-value").text('1.0x');

    isStarted = false;
}

