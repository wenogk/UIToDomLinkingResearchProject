function Check(o) {
  return o instanceof Element;
}
function getDef(element, def) {
  var str = "";

  var childs = element.childNodes;

  let tempRowTop = 0;
  let tempColLeftmost = 0;

  for (var i = 0; i < childs.length; ++i) {
    if (childs[i].nodeType != 3) {
      let typeOfChild = "";
      if (Check(childs[i]) && childs[i].getBoundingClientRect().width == 0) {
        continue;
      } else if (Check(childs[i])) {
        let boundingRectNode = childs[i].getBoundingClientRect();
        cx = boundingRectNode.left;
        cy = boundingRectNode.top;
        cw = boundingRectNode.width;
        ch = boundingRectNode.height;

        if (cy > tempRowTop) {
          typeOfChild += "row_split";
          tempRowTop = cx;
        }

        if (cx > tempColLeftmost) {
          typeOfChild += "col_split";
          tempColLeftmost = cx;
        }
      }
      let left = parseInt(def) * 10;
      str +=
        "  ".repeat(def) + childs[i].nodeName + " - " + typeOfChild + "<br />";
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
