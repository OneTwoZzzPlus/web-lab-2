export function head() {
    document.documentElement.setAttribute("lang", "ru");

    // <meta charset="UTF-8">
    const metaCharset = document.createElement("meta");
    metaCharset.setAttribute("charset", "UTF-8");
    document.head.append(metaCharset);

    // <meta name="viewport" content="width=device-width, initial-scale=1.0">
    const metaViewport = document.createElement("meta");
    metaViewport.setAttribute("name", "viewport");
    metaViewport.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0",
    );
    document.head.append(metaViewport);

    // <title>Задачник+</title>
    const title = document.createElement("title");
    title.textContent = "Задачник+";
    document.head.append(title);

    // <link rel="stylesheet" href="style.css">
    const linkStyle = document.createElement("link");
    linkStyle.setAttribute("rel", "stylesheet");
    linkStyle.setAttribute("href", "style.css");
    document.head.append(linkStyle);

    // <link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
    const linkFavicon = document.createElement("link");
    linkFavicon.setAttribute("rel", "icon");
    linkFavicon.setAttribute("type", "image/svg+xml");
    linkFavicon.setAttribute("href", "assets/favicon.svg");
    document.head.append(linkFavicon);
}
