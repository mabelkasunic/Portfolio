# Mabel Kasunic — Portfolio

A static website: plain HTML, CSS and JavaScript with no build step or dependencies.

## Open it in VS Code

1. Unzip the folder.
2. In VS Code, choose **File → Open Folder…** and select `mabel-portfolio`.
3. To preview it, install the **Live Server** extension (by Ritwick Dey), right-click `index.html` and choose **Open with Live Server**. You can also double-click `index.html` to open it straight in your browser.

## What's where

```
mabel-portfolio/
├── index.html        Home page (hero, projects, about, contact)
├── techtank.html     TechTank case study
├── resume.html       Résumé preview (opens Kasunic_Mabel_Resume.pdf)
├── about.html        About page (title with hover doodles)
├── css/
│   ├── base.css      Shared: fonts, colours, grid, header, reveal animation
│   ├── home.css      Home page styles (loading screen, hero, project cards)
│   ├── project.css   Case-study styles (slider, gallery, colour stack, quote)
│   ├── resume.css    Résumé page styles
│   └── about.css     About page styles
├── js/
│   └── main.js       Loading screen, scroll reveals, before/after slider, colour card loop
└── images/           All images used on both pages
```

## Common edits

- **Add a project:** in `index.html`, copy one `<article class="card rv">…</article>` block inside the projects grid, then change the link, image, title and category. Update the `Items (02)` count. For a new case study, duplicate `techtank.html` and swap its content.
- **Swap an image:** put the new file in `images/` and change the `src` (and `alt` description) in the HTML.
- **Colour card speed:** in `js/main.js`, change `1900` (milliseconds between cards).
- **Font:** if you have licensed Helvetica Neue LT Pro web font files, add them to a `fonts/` folder and add an `@font-face` rule at the top of `css/base.css`.

## Publishing

Any static host works. With GitHub Pages: push the folder to a repository, then in **Settings → Pages** choose the main branch and root folder.
