  <div className="product-info">
    <h1 className="product-name">{product.name}</h1>
    <div className="product-rating">
      <Rate disabled defaultValue={product.rating} /> 
      <span className="rating-count">({product.numReviews} đánh giá) | Đã bán: {product.sold}</span>
    </div>
    <div className="product-price">
      <span className="current-price">{product.price.toLocaleString()}₫</span>
      {product.discount > 0 && product.oldPrice !== product.price && (
        <>
          <span className="old-price">{product.oldPrice.toLocaleString()}₫</span>
          {product.discount > 0 && (
            <span className="discount-tag">-{product.discount}%</span>
          )}
        </>
      )}
    </div>
  </div> 