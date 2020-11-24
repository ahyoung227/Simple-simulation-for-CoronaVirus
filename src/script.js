//This is a simple Corona Virus Simulator. To run a simulation, you first have to choose an area you want to simulate. Then you should click 'Query Data' which will read the data from the Firebase. When you click 'Start simulation', it will visualize how people become infected corona virus and when they will be recovered from it.

//You can also update your information. For example, If positive cases, total population grows or activeness in the specific area have changed, you can change the current data to the most up-to-date data. Don't forget to click 'update data' in the bottom when you want to change the value with slider. Then, it will show a new simulation by clicking 'start simulation'.

// For version 2, I will add up more measures and graph.

//My code is based on youtube videos regarding collision detection. Here is the link -> collision detection — Part 1-2.(https://www.youtube.com/watch?v=XYzA_kPWyJ8&t=567s).

let db = firebase.firestore();
let areaRef = db.collection("Area");

var app = new Vue({
  el: "#app",
  data: {
    selected: undefined,
    activeness: undefined,
    initialInfect: undefined,
    population: undefined,
    selectedAreas: []
  },
  methods: {
    selectedArea() {
      areaRef.doc(this.selected).update({
        activeness: Number(this.activeness),
        initialInfect: Number(this.initialInfect),
        population: Number(this.population),
        name: this.selected
      });

      var selectedAreas = [];

      areaRef
        .where("name", "==", this.selected)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            selectedAreas.push(doc.data());
          });
        });
      this.selectedAreas = selectedAreas;
    },

    queryArea() {
      var selectedAreas = [];

      areaRef
        .where("name", "==", this.selected)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            selectedAreas.push(doc.data());
          });
        });
      this.selectedAreas = selectedAreas;
    },

    printData() {
      console.log(this.selectedAreas);
      this.plotData(
        this.selectedAreas[0].population,
        this.selectedAreas[0].initialInfect,
        this.selectedAreas[0].activeness
      );
    },

    plotData(population, initialInfect, activeness) {
      if (initialInfect > population) {
        alert("positive cases is larger than population");
        return -1;
      }

      var canvas = document.querySelector("canvas");
      var c = canvas.getContext("2d");

      canvas.width = 700;
      canvas.height = 700;

      const RADIUS = 10;
      const POPULATION = population;
      var PARTICLES;

      function getDistance(x1, y1, x2, y2) {
        let xDistance = x2 - x1;
        let yDistance = y2 - y1;
        return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
      }

      function randomIntFromRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
      }

      function rotate(velocity, angle) {
        const rotatedVelocities = {
          x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
          y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
        };

        return rotatedVelocities;
      }

      function resolveCollision(particle, otherParticle) {
        const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
        const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

        const xDist = otherParticle.x - particle.x;
        const yDist = otherParticle.y - particle.y;

        // Prevent accidental overlap of particles
        if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
          // Grab angle between the two colliding particles
          const angle = -Math.atan2(
            otherParticle.y - particle.y,
            otherParticle.x - particle.x
          );

          // Store mass in var for better readability in collision equation
          const m1 = particle.mass;
          const m2 = otherParticle.mass;

          // Velocity before equation
          const u1 = rotate(particle.velocity, angle);
          const u2 = rotate(otherParticle.velocity, angle);

          // Velocity after 1d collision equation
          const v1 = {
            x: (u1.x * (m1 - m2)) / (m1 + m2) + (u2.x * 2 * m2) / (m1 + m2),
            y: u1.y
          };
          const v2 = {
            x: (u2.x * (m1 - m2)) / (m1 + m2) + (u1.x * 2 * m2) / (m1 + m2),
            y: u2.y
          };

          // Final velocity after rotating axis back to original location
          const vFinal1 = rotate(v1, -angle);
          const vFinal2 = rotate(v2, -angle);

          // Swap particle velocities for realistic bounce effect
          particle.velocity.x = vFinal1.x;
          particle.velocity.y = vFinal1.y;

          otherParticle.velocity.x = vFinal2.x;
          otherParticle.velocity.y = vFinal2.y;
        }
      }

      // // Objects
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

        //draw a particle
        this.draw = function () {
          c.beginPath();
          c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
          c.fillStyle = this.color;
          c.fill();
          c.closePath();
        };

        // var clock = 0;

        //update new particles
        this.update = function (particles) {
          this.draw();

          //changing time
          if (this.color == "#FF7F66") {
            this.itime = this.itime + 1;
          }

          for (let i = 0; i < particles.length; i++) {
            if (this === particles[i]) continue;

            //collision effect between particle
            if (
              getDistance(this.x, this.y, particles[i].x, particles[i].y) -
                radius * 2 <
              0
            ) {
              resolveCollision(this, particles[i]);
            }
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
          }

          //changing direction when particle hits the canvas
          if (
            this.x - this.radius <= 0 ||
            this.x + this.radius >= canvas.width
          ) {
            this.velocity.x = -this.velocity.x;
          }

          if (
            this.y - this.radius <= 0 ||
            this.y + this.radius >= canvas.height
          ) {
            this.velocity.y = -this.velocity.y;
          }

          //adding distance-> chaning velocity
          this.x += this.velocity.x;
          this.y += this.velocity.y;

          if (this.itime > 800) {
            this.itime = -1;
            this.color = "#2185C5";
          }

          // var tmp_count = 0;
          // for (let i =0; i < particles.length; i++) {
          //   if (particles[i].color == '#FF7F66'){
          //     tmp_count = tmp_count + 1;
          //   }
          // }

          // if (clock == 100) {
          //   console.log(tmp_count);
          //   clock = 0;
          // } else {
          //   clock += 1;
          // }
        };
      }

      // // Implementation

      function init() {
        PARTICLES = [];

        maxCount = 0;
        for (let i = 0; i < POPULATION; i++) {
          let x = randomIntFromRange(RADIUS, canvas.width - RADIUS);
          let y = randomIntFromRange(RADIUS, canvas.height - RADIUS);
          maxCount = maxCount + 1;

          var color = "#666565";
          var itime = -1;
          if (i < initialInfect) {
            color = "#FF7F66";
            itime = 0;
          }

          if (i !== 0) {
            for (let j = 0; j < PARTICLES.length; j++) {
              if (
                getDistance(x, y, PARTICLES[j].x, PARTICLES[j].y) - RADIUS * 2 <
                0
              ) {
                x = randomIntFromRange(RADIUS, canvas.width - RADIUS);
                y = randomIntFromRange(RADIUS, canvas.height - RADIUS);
                maxCount = maxCount + 1;
                j = -1;
              }
              if (maxCount > 10000) {
                alert("too many trials");
                return -1;
              }
            }
          }
          PARTICLES.push(new Particle(x, y, RADIUS, color, itime));
        }
        return 0;
      }

      // Animation Loop(print updated particle)
      function animate() {
        requestAnimationFrame(animate);
        c.clearRect(0, 0, canvas.width, canvas.height);

        PARTICLES.forEach((particle) => {
          particle.update(PARTICLES);
        });
      }

      var init_error = init();
      if (init_error == 0) {
        animate();
      }
    }
  }
});
