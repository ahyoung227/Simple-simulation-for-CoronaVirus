# Simple simulation for CoronaVirus

This project was built for MSTU 5013 Theory and Programming of Interactive Media in 2020.
The file structure was designed to meet the project's requirements.


## About The Project

Welcome to the Corona Virus Simulator, a tool designed to help users better understand how the virus spreads and how different interventions may impact its spread.

<img src="covid19Simulator.gif" width="700px" height="500px">

## How to use?
Start by selecting the region that you want to include in your simulation. 

Once you have selected the region, system is ready to load its parameter(activeness, positive cases and population per square miles/100) from Firebase db.
To query data, click on the 'Query Data' button to retrieve.

With the data in hand, you can then initiate the simulation by clicking the 'Start Simulation' button. 
This will allow you to visualize the spread of the virus and how individuals become infected and eventually recover.

Throughout the simulation, you may want to adjust the parameters to see how they impact the outcome of the simulation. 
This can help you identify which interventions may be most effective in slowing the spread of the virus.
## Feature and Implementation

### Visualizing spread of the virus and its recovery
To build the simulation, I designed a Particle class that contains various attributes, including the particle's position(represented by its x and y coordinates), velocity, and color. 
Each color is used to represent a different state of the particle, such as positive ("#FF7F66") or recovered ("#666565").

To make the simulation more realistic, I set the initial velocity of each particle based on the level of activeness in the area you have selected. 
This helps to ensure that the simulation accurately reflects the potential spread of the virus in different environments.
```
  function Particle(x, y, radius, color, itime) {
    this.x = x;
    this.y = y;
    this.itime = itime;

    this.velocity = {
      x: (Math.random() - 0.5) * activeness,
      y: (Math.random() - 0.5) * activeness
    };
    this.radius = radius;
    this.color = color;
    this.mass = 1;
    ...
  }
```
#### Gray("#666565") represents a negative state, meaning the individual is not infected with the virus. 
#### Red("#FF7F66") represents a positive state, meaning the individual has contracted the virus and is infectious. 
#### Blue("#2185C5") represents a recovered state, meaning the individual has recovered from the virus and is no longer infectious

To create the simulation animation, I utilized the Canvas API, which allows for dynamic, interactive graphics. 
The movement of each particle is controlled by adding a velocity vector to its position.
```
  ...
  let canvas = document.querySelector("canvas");
  let c = canvas.getContext("2d");
  ...
  function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);

    PARTICLES.forEach((particle) => {
      particle.update(PARTICLES);
    });
  }
```

### Collision detection
To detect two particle collide each other, I used [Pythagorean theorem](https://en.wikipedia.org/wiki/Pythagorean_theorem) to calculate a distance. 
```
  function getDistance(x1, y1, x2, y2) {
    let xDistance = x2 - x1;
    let yDistance = y2 - y1;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
  }
```
If the distance between two particles is smaller than the sum of their radius, and one particle is in the positive ("#FF7F66") state, it will cause the other particle to transition to the positive state as well. 
However, if a particle has already recovered ("#666565") from the positive state, it will not be affected by nearby positive particles.
```
    if (
      getDistance(this.x, this.y, particles[i].x, particles[i].y) -
        radius * 2 <
        0 &&
      this.color == "#FF7F66"
    ) {
      if (particles[i].color == "#2185C5") {
        continue;
      }
      if (particles[i].color == "#666565") {
        particles[i].color = "#FF7F66";
        particles[i].itime = 0;
      }
    }
```
### Updating recent information
To ensure that their simulation is based on the most up-to-date information available, users can update their local data as needed in the firebase. 

For example, if there are changes in the number of positive cases or the total population, a user can adjust the relevant values using the slider and then click the 'Update Data' button at the bottom of the page.
Once users have updated their data, users can then start a new simulation by clicking the 'Start Simulation' button once again. This will allow users to see how changes in the data impact the spread of the virus. 


For version 2, I will add up more measures and graph.
I hope that this tool will help users develop effective strategies for mitigating its spread.



## License

Distributed under the MIT License. See `LICENSE` for more information.
