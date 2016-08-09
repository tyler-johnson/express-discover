import test from "tape";
import express from "express";
import registerService from "../src/index.js";

test("app can discover itself", function(t) {
  t.plan(2);
  let app = express();
  registerService("testapp", app);

  t.equals(app.discover("testapp"), app, "discover() returns self");
  t.equals(app.discoverPath("testapp"), "", "discoverPath is empty string");
  t.end();
});

test("apps can discover each other", function(t) {
  t.plan(4);
  let app = express();
  registerService("testapp", app);

  let child = express();
  registerService("childapp", child);
  app.use("/childroute", child);

  t.equals(app.discover("childapp"), child, "app.discover() returns child");
  t.equals(app.discoverPath("childapp"), "/childroute", "app.discoverPath() is child mountpath");
  t.equals(child.discover("testapp"), app, "child.discover() returns app");
  t.equals(child.discoverPath("testapp"), "", "child.discoverPath() is empty string");
  t.end();
});

test("app discover url accepts params", function(t) {
  t.plan(2);
  let parent = express();

  let app = express();
  parent.use("/:name", app);
  registerService("testapp", app);

  t.equals(app.discoverPath("testapp"), "/:name", "discoverPath without params is param string");
  t.equals(app.discoverPath("testapp", { name: "foo" }), "/foo", "discoverPath with params replaces");
  t.end();
});

test("apps can discover parent backup paths", function(t) {
  t.plan(1);
  let app = express();
  registerService("testapp", app, {
    backup: "/backup"
  });

  let child = express();
  registerService("childapp", child);
  app.use("/childroute", child);

  t.equals(child.discoverPath("backup"), "/backup", "child discovers parent backup path");
  t.end();
});

test("apps can discover sibling backup paths", function(t) {
  t.plan(2);
  let app = express();
  registerService("testapp", app);

  let child1 = express();
  registerService("child1app", child1, {
    backup1: "/backup1"
  });
  app.use("/child1route", child1);

  let child2 = express();
  registerService("child2app", child2, {
    backup2: "/backup2"
  });
  app.use("/child2route", child2);

  t.equals(child1.discoverPath("backup2"), "/backup2", "child1 discovers child2 backup path");
  t.equals(child2.discoverPath("backup1"), "/backup1", "child2 discovers child1 backup path");
  t.end();
});
