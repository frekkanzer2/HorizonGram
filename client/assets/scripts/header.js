// header.js
document.addEventListener("DOMContentLoaded", function() {
    const headerHTML = `
<div id="header">

    <div class="top">

            <div id="logo">
                <a href="index.html" id="header-link">
                    <span class="image avatar48">
                        <img src="images/avatar.png" alt="" />
                    </span>
                    <h1 id="title">HorizonGram</h1>
                </a>
                <p>Cloud storage manager</p>
            </div>

            <nav id="nav">
                <ul>
                    <li><a href="" id="top-link"><span class="icon solid fa-upload">Upload a file</span></a></li>
                    <li><a href="newfolder.html" id="top-link"><span class="icon solid fa-folder">New folder</span></a></li>
                    <li><a href="" id="top-link"><span class="icon solid fa-file">Your files</span></a></li>
                </ul>
            </nav>

    </div>

</div>
    `;
    document.getElementById('header-container').innerHTML = headerHTML;
});
