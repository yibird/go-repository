import type { Sidebar } from "../typing";
import base from "./base";
import concurrent from "./concurrent";
import network from "./network";
import web from "./web";
import orm from "./orm";

const sidebars: Sidebar = [base, concurrent, network, web, orm];
export default sidebars;
