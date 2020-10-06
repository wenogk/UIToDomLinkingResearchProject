function getChildren(ParentNode) {
  children = []; //array holding all valid children
  let nodes = ParentNode.childNodes;

  for (let i = 0; i < nodes.length; i++) {
    //iterating through children

    if (nodes[i]) {
      // check if node is valid
      let temp = getChildren(nodes[i]);
      let boundingRectTemp = temp.getBoundingClientRect();
      let boundingRectNode = node[i].getBoundingClientRect();

      if (temp == null) {
      }
      nodes[i].style.background = color;
    }
  }
}
