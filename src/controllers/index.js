const showHomePage = (req, res) => {
  res.render('home', { title: 'Home', currentPage: 'home' });
};

export { showHomePage };
