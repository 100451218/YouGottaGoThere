function TagFilter({tag, onClick}){
  return (
    <label className="tagFilter-container">
      <span>{tag.name}</span>
      <input 
        className="tagFilter" 
        type="checkbox" 
        value={tag.id} 
        onChange={onClick}
      />
    </label>
  )
}


export default TagFilter