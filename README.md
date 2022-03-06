# JPEG Sandbox 

This is a very barebones editor that supports clicking on any pixel in a JPEG image to see the 64 DCT coefficients that make up that 8x8 block. Each individual coefficient can be edited through text. You can also use the slider to zero out coefficients one by one starting with the lowest absolute value (which is what you'd do during compression) or reverse that to see what it would look like to throw away the most important coefficients first.

It also visualizes the coefficients that make up each individual block in order of their weight. 


### Local setup 

Run `yarn` to install dependencies and `yarn dev` to run. Run the app on [localhost:3000](http://localhost:3000/).


