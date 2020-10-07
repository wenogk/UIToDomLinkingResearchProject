function Check(o) {
  return o instanceof Element;
}
function addCss() {
  var link = document.createElement("link");
  link.href = chrome.extension.getURL("injectionCSS.css");
  link.type = "text/css";
  link.rel = "stylesheet";
  document.getElementsByTagName("head")[0].appendChild(link);
}
function getBoundingRect(elem, ifErrorReturnZeros = false) {
  if (Check(elem)) {
    let boundingRectNode = elem.getBoundingClientRect();
    cx = boundingRectNode.left;
    cy = boundingRectNode.top;
    cw = boundingRectNode.width;
    ch = boundingRectNode.height;

    return {
      x: cx,
      y: cy,
      w: cw,
      h: ch,
    };
  } else {
    if (ifErrorReturnZeros) {
      return {
        x: 0,
        y: 0,
        w: 0,
        h: 0,
      };
    }
  }
}

function colorBasedOnType(elem) {
  interactiveElements = ["A", "BUTTON"];
  if (interactiveElements.includes(elem.nodeName)) {
    if (elem.nodeName == "A") {
      if (elem.href) {
        return "red";
      } else {
        return "blue";
      }
    }
    return "red";
  } else {
    return "#4B0082";
  }
}

function getDef(element, def) {
  //addCss();
  var str = "";

  var childs = element.childNodes;

  let tempRowTop = getBoundingRect(element, true).y;
  let tempColLeftmost = getBoundingRect(element, true).x;
  //find first valid child and set top and left vals
  /*
  let index = 0;
  let skipDefault = false;
  while (!Check(childs[index])) {
    index += 1;
    if (index >= childs.length) {
      skipDefault = true;
      break;
    }
  }
  if (!skipDefault) {
    tempRowTop = childs[index].getBoundingClientRect().top;
    tempColLeftmost = childs[index].getBoundingClientRect().left;
  }
*/
  for (var i = 0; i < childs.length; ++i) {
    if (childs[i].nodeType != 3 && childs[i].nodeType != 8) {
      let typeOfChild = [];
      if (Check(childs[i]) && childs[i].getBoundingClientRect().width == 0) {
        continue;
      } else if (Check(childs[i])) {
        if (getBoundingRect(childs[i]).y > tempRowTop) {
          typeOfChild.push("row_split");
          tempRowTop = cx;
        }

        if (getBoundingRect(childs[i]).x > tempColLeftmost) {
          typeOfChild.push("col_split");
          tempColLeftmost = cx;
        }
      }
      let left = parseInt(def) * 10;
      str +=
        "  ".repeat(def) +
        "<font color='" +
        colorBasedOnType(childs[i]) +
        "'>" +
        childs[i].nodeName +
        "</font> - " +
        typeOfChild.join(", ") +
        "<br />";
      str += getDef(childs[i], def + 1);
    }
  }

  return str;
}
function getChildren(ParentNode) {
  return getDef(ParentNode, 0);
  children = []; //array holding all valid children
  let nodes = ParentNode.childNodes;
  //node = document_root.firstChild;
  for (let i = 0; i < nodes.length; i++) {
    //iterating through children

    //str += nodes[i].tagName;
    if (Check(nodes[i])) {
      // check if node is valid
      let temp = getChildren(nodes[i]);
      let minimumBoundingRectangleInChild = false;
      let boundingRectNode = nodes[i].getBoundingClientRect();
      cx = boundingRectNode.left;
      cy = boundingRectNode.top;
      cw = boundingRectNode.width;
      ch = boundingRectNode.height;
      let minTx = 999999999;
      let maxTy = 0;
      let maxTw = 0;
      let maxTh = 0;

      for (let j = 0; j < temp.length; j++) {
        if (!Check(temp[j])) {
          continue;
        }
        let boundingRectTemp = temp[j].getBoundingClientRect();
        tx = boundingRectTemp.left;
        ty = boundingRectTemp.top;
        tw = boundingRectTemp.width;
        th = boundingRectTemp.height;

        if (tx < minTx) {
          minTx = tx;
        }

        if (ty > maxTy) {
          maxTy = ty;
        }

        if (tw > maxTw) {
          maxTw = tw;
        }

        if (th > maxTh) {
          maxTh = th;
        }
      }

      let maxArea = maxTw * maxTh;
      let cArea = cw * ch;
      console.log(
        "vals --> (" +
          maxArea +
          " - " +
          cArea +
          ") § (" +
          minTx +
          "-" +
          cx +
          ")"
      );
      if (maxArea <= cArea && minTx <= cx) {
        minimumBoundingRectangleInChild = true;
      }

      // if temp is null OR the temp (child) bounding rect is within the node[i] (parent), then add node[i] to children array

      if (temp == null || minimumBoundingRectangleInChild) {
        children.push(nodes[i]);
      } else {
        children.push(temp);
      }
    }
  }
  console.log(children);
  return children;
}

chrome.runtime.sendMessage({
  action: "getChildren",
  source: getChildren(document),
});
