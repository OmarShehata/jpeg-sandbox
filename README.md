# JPEG Sandbox 

This is a very barebones editor that supports clicking on any pixel in a JPEG image to see the 64 DCT coefficients that make up that 8x8 block. Each individual coefficient can be edited through text. You can also use the slider to zero out coefficients one by one starting with the lowest absolute value (which is what you'd do during compression) or reverse that to see what it would look like to throw away the most important coefficients first.

![jpeg-sandbox](https://user-images.githubusercontent.com/1711126/156947853-cb27be68-9f1b-4b3b-bd96-aba18cfc36a1.gif)

It also visualizes the coefficients that make up each individual block in order of their weight. 

![jpeg-sandbox2](https://user-images.githubusercontent.com/1711126/156947858-542614db-52f8-41b1-b377-c34e532453b3.gif)

I created this to help with explaining how JPEG works for a talk at CodeBar 2022.

Cat picture by [Mikhail Vasilyev](https://unsplash.com/photos/NodtnCsLdTE). Also inspired by the visualization in [https://www.jezzamon.com/fourier/](https://www.jezzamon.com/fourier/).

See also my [Unraveling the JPEG](https://parametric.press/issue-01/unraveling-the-jpeg/) article.

### Local setup 

Run `yarn` to install dependencies and `yarn dev` to run. Run the app on [localhost:3000](http://localhost:3000/).


