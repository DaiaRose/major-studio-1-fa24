
// load the data for 2018
d3.text('Data/output.txt').then(data => { 
  text = data;
  // split the text into lines
  lines = text.split('\n');
  // remove empty lines
  lines = lines.filter(i => i.length > 0);
  let frequency = analyzeData(lines);
  displayData(frequency, 'Word Frequency NASM');
});


/*
function analyzeData(lines) {
  let phrase;
  let frequency = [];
  // loop over the array
  lines.forEach(line => {
    // split the line into words
    let words = line.split(' ');
    // loop over the words
    words.forEach(word => {
      // remove empty words
      if(word.length == 0) return;
      // remove special characters 
      phrase = word.replace(/[^a-zA-Z ]/g, "");//this is regex, it removes all characters that are not a-z or A-Z
      //can also remove common words
      if (['the', 'and', 'a', 'to', 'of', 'in', 'was'].includes(phrase)) return;
      // check if the word is in the array
      let match = false;
      frequency.forEach(i => {
        if(i.word == word) {
          i.count++;
          match = true;
        }
      });
      // if not, add it to the array
      if(!match) {
        frequency.push({
          word: phrase,
          count: 1
        });
      }
    });
  });//makes key the word and value the count

  // get entries that are not unique
  frequency = frequency.filter(item => item.count > 1);
  // show the frequency map
  console.log(frequency);
  // sort the frequency map
  frequency.sort((a, b) => (a.count < b.count) ? 1 : -1);
  return frequency;
}
*/

function analyzeData(lines) {
  let phrase;
  let frequencyMap = new Map();

  // Loop over the array
  lines.forEach(line => {
    // Split the line into words
    let words = line.split(' ');
    // Loop over the words
    words.forEach(word => {
      // Remove special characters and make lowercase
      phrase = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
      // Filter out common stop words
      if (phrase.length === 0 || ['the', 'and', 'a', 'to', 'of', 'in', 'was', 'for', 'on', 'by', 'with', 'as'].includes(phrase)) {
        return;
      }
      // If the word is already in the map, increment its count
      if (frequencyMap.has(phrase)) {
        frequencyMap.set(phrase, frequencyMap.get(phrase) + 1);
      } else {
        // Otherwise, add the word with a count of 1
        frequencyMap.set(phrase, 1);
      }
    });
  });

  // Convert the map to an array of objects
  let frequency = Array.from(frequencyMap, ([word, count]) => ({ word, count }));

  // Filter out words with a count of 1
  frequency = frequency.filter(item => item.count > 1);

  // Sort the frequency array by count, descending
  frequency.sort((a, b) => (a.count < b.count) ? 1 : -1);
  console.log(frequency);

  return frequency;
}


// display the data
function displayData(frequency, title) {
  // define dimensions and margins for the graphic
  const margin = ({top: 100, right: 50, bottom: 100, left: 80});
  const width = 1920*15;
  const height = 1080-margin.top;

  // let's define our scales. 
  // yScale corresponds with amount of textiles per country
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(frequency, d => d.count)+1])
    .range([height - margin.bottom, margin.top]); 

  // xScale corresponds with country names
  const xScale = d3.scaleBand()
    .domain(frequency.map(d => d.word))
    .range([margin.left, width - margin.right]);
  
  // create the svg element
  const svg = d3.select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('style', 'background-color:#C8E6F4');
  
  // attach a graphic element, and append rectangles to it
  svg.append('g')
    .selectAll('rect')
    .data(frequency)
    .join('rect')
    .attr('x', d => xScale(d.word))
    .attr('y', d => yScale(d.count))
    .attr('height', d => yScale(0) - yScale(d.count))
    .attr('width', d => xScale.bandwidth() - 2)
    .style('fill', 'steelblue');

  // add the x axis
  const xAxis = d3.axisBottom(xScale);

  svg.append('g')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(xAxis)
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-.6em')
    .attr('dy', '-0.1em')
    .attr('transform', d => {return 'rotate(-45)' });

  // add the y axis
  const yAxis = d3.axisLeft(yScale).ticks(5);

  svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(yAxis);

  // add the title
  svg.append('text')
    .attr('x', margin.left)
    .attr('y', 50)
    .style('font-size', '24px')
    .style('font-family', 'sans-serif')
    .style('font-weight', 'bold')
    .text(title);

}