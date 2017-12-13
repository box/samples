<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8" />
    <title>Java Servlet Template</title>
    <link href='//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css' rel='stylesheet' type='text/css'>
    <link href='//maxcdn.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css' rel='stylesheet' type='text/css'>
    <link href='//fonts.googleapis.com/css?family=Open+Sans:100,200,400,300,600' rel='stylesheet' type='text/css'>
    <script src='//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js'></script>
    <script src='//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js'></script>
    <link rel="stylesheet" href="https://cdn01.boxcdn.net/platform/preview/1.16.0/en-US/preview.css" />
    <link rel="stylesheet" href="https://cdn01.boxcdn.net/platform/elements/1.6.1/en-US/explorer.css" />
    <link rel="stylesheet" href="https://cdn01.boxcdn.net/platform/elements/1.6.1/en-US/picker.css" />
    <link rel="stylesheet" href="https://cdn01.boxcdn.net/platform/elements/1.6.1/en-US/uploader.css" />
    <link rel="stylesheet" href="https://cdn01.boxcdn.net/platform/elements/1.6.1/en-US/tree.css" />
    <style>
        body{
            font-family:"Open Sans",sans-serif;
            background-color:#f9f9f9;
            color: #666;
            font-weight: 300;
            }
        h1{font-weight: 300;}
        h3{font-weight: 300;}
        .navbar-inverse {
            background-color: #3278cf;
            border-color: #3278cf;
            border-radius: 0px
        }
        .navbar-inverse .navbar-brand {
            font-size: 150%;
            color: #fff
        }
        .footer {
            height: 50px;
            text-align: right;
            font-size: 120%;
            color: #DDD
        }
        .btn-primary {
            background-color: #3278cf;
            border-color: #3278cf
        }
    </style>
  </head>
  <body>
      <nav class='navbar navbar-inverse'>
        <div class='container'>
          <div class='navbar-header'>
            <a class='navbar-brand' href='/dashboard'>
              Box Platform Java Example
            </a>
          </div>
      </nav>
    <div class="container">