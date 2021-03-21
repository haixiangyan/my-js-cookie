const ghpages = require('gh-pages');

ghpages.publish('dist', function(err) {
  if (err) {
    console.error('Deploy failed! \n' + err)
  }

  console.log('Deployed successfully!')
});
