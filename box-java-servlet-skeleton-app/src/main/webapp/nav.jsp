<nav class="navbar navbar-default">
    <div class="container-fluid">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1"
                aria-expanded="false">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="#">Brand</a>
        </div>

        <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            <ul class="nav navbar-nav">
                <li>
                    <a href="/dashboard">Content Explorer</a>
                </li>
                <li>
                    <a href="/content-picker">Content Picker</a>
                </li>
                <li>
                    <a href="/content-uploader">Content Uploader</a>
                </li>
                <li>
                    <a href="/content-tree">Content Tree</a>
                </li>
            </ul>
            <ul class="nav navbar-nav pull-right">
                <li>
                    <a href="/logout?accessToken=${accessToken}">Log Out</a>
                </li>
            </ul>
        </div>
    </div>
</nav>